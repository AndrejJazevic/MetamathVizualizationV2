let verifiedLabels = [];
let verifiedList = [];

const indexedDB = window.indexedDB || 
				  window.mozIndexedDB ||
				  window.webkitIndexedDB ||
				  window.msIndexedDB ||
				  window.shimIndexedDB;

class Toks {
    constructor(lines) {
        this.linesBuf = lines;
        this.tokBuf = [];
        this.importedFiles = new Set();
    }

    read() {
        while (this.tokBuf.length === 0) {
            let line = this.linesBuf[this.linesBuf.length - 1];
            if (!line) {
                this.linesBuf.pop();
                if (this.linesBuf.length === 0) {
					return null;
				}
            } else {
                this.tokBuf = line.split(/\s+/).reverse().filter(str => str !== "");
				this.linesBuf.pop();
            }
        }
        return this.tokBuf.pop();
    }

    readf() {
        let tok = this.read();
        while (tok === '$[') {
            let filename = this.read();
            let endBracket = this.read();
            if (endBracket !== '$]') {
                throw new Error('Incusion command not terminated');
            }
            filename = fs.realpathSync(filename);
            if (!this.importedFiles.has(filename)) {
                this.linesBuf.push(fs.createReadStream(filename));
                this.importedFiles.add(filename);
            }
            tok = this.read();
        }
        return tok;
    }

    readc() {
        while (true) {
            let tok = this.readf();
            if (tok === null) {
				return null;
			}
            if (tok === '$(') {
                while (tok !== '$)') {
                    tok = this.read();
                }
            } else {
                return tok;
            }
        }
    }

    readstat() {
        let stat = [];
        let tok = this.readc();
        while (tok !== '$.') {
            if (tok === null) {
				throw new Error('EOF before $.');
			}
            stat.push(tok);
            tok = this.readc();
        }
        return stat;
    }
}

class Frame {
    constructor() {
        this.c = new Set();
        this.v = new Set();
        this.d = new Set();
        this.f = [];
        this.fLabels = {};
        this.e = [];
        this.eLabels = {};
    }
}

class FrameStack extends Array {
    push() {
        this[this.length] = new Frame();
    }

    addC(tok) {
        let frame = this[this.length - 1];
        if (frame.c.has(tok)) {
			throw new Error('const already defined in scope');
		}
        if (frame.v.has(tok)) {
			throw new Error('const already defined as var in scope');
		}
        frame.c.add(tok);
    }

    addV(tok) {
        let frame = this[this.length - 1];
        if (frame.v.has(tok)) {
			throw new Error('var already defined in scope');
		}
        if (frame.c.has(tok)) {
			throw new Error('var already defined as const in scope');
		}
        frame.v.add(tok);
    }

    addF(varName, kind, label) {
        if (!this.lookupV(varName)) {
			throw new Error('var in $f not defined: ${varName}');
		}
        if (!this.lookupC(kind)) {
			throw new Error('const in $f not defined ${kind}');
		}
        let frame = this[this.length - 1];
        if (varName in frame.fLabels) {
			throw new Error('var in $f already defined in scope');
		}
        frame.f.push([varName, kind]);
        frame.fLabels[varName] = label;
    }

    addE(stat, label) {
        let frame = this[this.length - 1];
        frame.e.push(stat);
        frame.eLabels[JSON.stringify(stat)] = label;
    }

    addD(stat) {
        let frame = this[this.length - 1];
        let newSet = new Set(frame.d);
		for (let i = 0; i < stat.length; i++) {
			for (let j = i + 1; j < stat.length; j++) {
				let pair = [Math.min(stat[i], stat[j]), Math.max(stat[i], stat[j])];
				newSet.add(pair);
			}
		}
		frame.d = newSet;
    }

    lookupC(tok) {
        return this.slice().reverse().some(fr => fr.c.has(tok));
    }

    lookupV(tok) {
        return this.slice().reverse().some(fr => fr.v.has(tok));
    }

    lookupF(varName) {
        for (let frame of this.slice().reverse()) {
            if (varName in frame.fLabels) {
				return frame.fLabels[varName];
			}
        }
        throw new Error(varName);
    }

    lookupD(x, y) {
        return this.slice().reverse().some(fr => fr.d.has([Math.min(x, y), Math.max(x, y)]));
    }

    lookupE(stmt) {
        for (let frame of this.slice().reverse()) {
            if (JSON.stringify(stmt) in frame.eLabels) {
				return frame.eLabels[JSON.stringify(stmt)];
			}
        }
        throw new Error(JSON.stringify(stmt));
    }

    makeAssertion(stat) {
        let frame = this[this.length - 1];
        let eHyps = [...this.map(fr => fr.e).flat()];
		let mandVars = new Set();

		for (let hyp of [...eHyps, stat]) {
			for (let tok of hyp) {
				if (this.lookupV(tok)) {
					mandVars.add(tok);
				}
			}
		}

        let pairs = this.flatMap(fr => 
		  [...fr.d].filter(([x, y]) => x !== y && mandVars.has(x) && mandVars.has(y))
		);
		let normalizedPairs = pairs.map(([x, y]) => [Math.min(x, y), Math.max(x, y)]);
		let dvs = new Set(normalizedPairs);

        let fHyps = [];
        for (let fr of this.slice().reverse()) {
			for (let [k, v] of fr.f.reverse()) {
				if (mandVars.has(k)) {
					fHyps.unshift([v, k]);
					mandVars.delete(v);
				}
			}
			fr.f.reverse();
        }
        return [dvs, fHyps, eHyps, stat];
    }
}

class Metamath {
    constructor() {
        this.fs = new FrameStack();
        this.labels = {};
    }

    read(toks) {
        this.fs.push();
        let label = null;
        let tok = toks.readc();
		while (tok !== null && tok !== '$}') {
            if (tok === '$c') {
                for (let tok of toks.readstat()) {
					this.fs.addC(tok);
				}
            } else if (tok === '$v') {
                for (let tok of toks.readstat()) {
					this.fs.addV(tok);
				}
            } else if (tok === '$f') {
                let stat = toks.readstat();
                if (!label) {
					throw new Error('$f must have label');
				}
                if (stat.length !== 2) {
					throw new Error('$f must have be length 2');
				}
                this.fs.addF(stat[1], stat[0], label);
                this.labels[label] = ['$f', [stat[0], stat[1]]];
                label = null;
            } else if (tok === '$a') {
                if (!label) {
					throw new Error('$a must have label');
				}
				this.labels[label] = ['$a', this.fs.makeAssertion(toks.readstat())];
                label = null;
            } else if (tok === '$e') {
                if (!label) {
					throw new Error('$e must have label');
				}
                let stat = toks.readstat();
                this.fs.addE(stat, label);
                this.labels[label] = ['$e', stat];
                label = null;
            } else if (tok === '$p') {
                if (!label) {
					throw new Error('$p must have label');
				}
                let stat = toks.readstat();
                let proof = null;
                try {
                    let i = stat.indexOf('$=');
                    proof = stat.slice(i + 1);
                    stat = stat.slice(0, i);
                } catch (error) {
                    throw new Error('$p must contain proof after $=');
                }

                this.verify(label, stat, proof);
				verifiedLabels.push(label);
				this.labels[label] = ['$p', this.fs.makeAssertion(stat)];
				label = null;
            } else if (tok === '$d') {
                this.fs.addD(toks.readstat());
            } else if (tok === '${') {
                this.read(toks);
            } else if (!tok.startsWith('$')) {
                label = tok;
            }
            tok = toks.readc();
        }
        this.fs.pop();
    }

    applySubst(stat, subst) {
        let result = [];
        for (let tok of stat) {
            if (tok in subst) {
                result.push(...subst[tok]);
            } else {
                result.push(tok);
            }
        }
        return result;
    }

    findVars(stat) {
        let vars = [];
        for (let x of stat) {
            if (!vars.includes(x) && this.fs.lookupV(x)) {
				vars.push(x);
			}
        }
        return vars;
    }

    decompressProof(stat, proof) {
        let [dm, mandHypStmts, hypStmts, newStat] = this.fs.makeAssertion(stat);

        let mandHyps = mandHypStmts.map(([k, v]) => this.fs.lookupF(v));
        let hyps = hypStmts.map(s => this.fs.lookupE(s));

        let labels = [...mandHyps, ...hyps];
        let hypEnd = labels.length;
        let ep = proof.indexOf(')');
        labels.push(...proof.slice(1, ep));
		
		let compressedProofList = proof.slice(ep + 1);
		let compressedProof = compressedProofList.join('');
        let proofInts = [];
        let curInt = 0;

        for (let ch of compressedProof) {
            if (ch === 'Z') {
				proofInts.push(-1);
			}
            else if ('A'.charCodeAt(0) <= ch.charCodeAt(0) && ch.charCodeAt(0) <= 'T'.charCodeAt(0)) {
                curInt = (20 * curInt + ch.charCodeAt(0) - 'A'.charCodeAt(0) + 1);
                proofInts.push(curInt - 1);
                curInt = 0;
            } else if ('U'.charCodeAt(0) <= ch.charCodeAt(0) && ch.charCodeAt(0) <= 'Y'.charCodeAt(0)) {
                curInt = (5 * curInt + ch.charCodeAt(0) - 'U'.charCodeAt(0) + 1);
            }
        }
		
        let labelEnd = labels.length;
        let decompressedInts = [];
        let subproofs = [];
        let prevProofs = [];
        for (let pfInt of proofInts) {
            if (pfInt === -1) {
				subproofs.push(prevProofs[prevProofs.length - 1]);
			}
            else if (0 <= pfInt && pfInt < hypEnd) {
                prevProofs.push([pfInt]);
                decompressedInts.push(pfInt);
            } else if (hypEnd <= pfInt && pfInt < labelEnd) {
                decompressedInts.push(pfInt);

                let step = this.labels[labels[pfInt]];
                let [stepType, stepData] = step;
                if (stepType === '$a' || stepType === '$p') {
                    let [sd, svars, shyps, sresult] = stepData;
                    let nshyps = shyps.length + svars.length;
					let newPrevPf = [];
					if (nshyps !== 0) {
						newPrevPf = [...prevProofs.slice(-nshyps).flat(), pfInt];
						prevProofs = prevProofs.slice(0, -nshyps);
					} else {
						newPrevPf = [pfInt];
					}
                    prevProofs.push(newPrevPf);
                } else {
                    prevProofs.push([pfInt]);
                }
            } else if (labelEnd <= pfInt) {
                let pf = subproofs[pfInt - labelEnd];
                for (let i = 0; i < pf.length; i++) {
					decompressedInts.push(pf[i]);
				}
                prevProofs.push(pf);
            }
        }

        return decompressedInts.map(i => labels[i]);
    }

    verify(statLabel, stat, proof) {
        let stack = [];
		let info = new Info();
        let statType = stat[0];
        if (proof[0] === '(') {
			proof = this.decompressProof(stat, proof);
		}
        for (let label of proof) {
            let [stepType, stepData] = this.labels[label];
			
            if (stepType === '$a' || stepType === '$p') {
                let [distinct, mandVar, hyp, result] = stepData;
                let npop = mandVar.length + hyp.length;
                let sp = stack.length - npop;
                if (sp < 0) throw new Error('stack underflow');
                let subst = {};
                for (let [k, v] of mandVar) {
                    let entry = stack[sp];
                    if (entry[0] !== k) {
                        throw new Error('stack entry (${k}, ${v}) doesn\'t match mandatory var hyp ${entry}');
                    }
                    subst[v] = entry.slice(1);
                    sp += 1;
                }
                for (let [x, y] of distinct) {
                    for (let [xVar, yVar] of [this.findVars(subst[x]), this.findVars(subst[y])]) {
                        if (xVar === yVar || !this.fs.lookupD(xVar, yVar)) {
                            throw new Error('disjoint violation: ${xVar}, ${yVar}');
                        }
                    }
                }
                for (let h of hyp) {
                    let entry = stack[sp];
                    let substH = this.applySubst(h, subst);
                    if (JSON.stringify(entry) !== JSON.stringify(substH)) {
                        throw new Error('stack entry ${entry} doesn\'t match hypothesis ${substH}');
                    }
                    sp += 1;
                }
				if (result[0] === "|-") {
					info.resultList.push(stepData);
					info.subsDict.push(subst);
					info.mandList.push(mandVar);
				}
				
				stack.splice(stack.length - npop, stack.length);
				stack.push(this.applySubst(result, subst));
            } else if (stepType === '$e' || stepType === '$f') {
                stack.push(stepData);
            }
        }
        if (stack.length !== 1) {
			throw new Error('stack has > 1 entry at end');
		}
        if (JSON.stringify(stack[0]) !== JSON.stringify(stat)) {
			throw new Error('assertion proved doesn\'t match');
		}
		info.label = statLabel;
		info.provingExpression = stat;
		verifiedList.push(info);
    }
}


function main(input) {
	verifiedLabels.length = 0;
	verifiedList.length = 0;
	const metamath = new Metamath();
	metamath.read(new Toks(input.reverse()));
}




class Info {
	constructor() {
		this.label = "";
		this.provingExpression = "";
		this.resultList = [];
		this.subsDict = [];
		this.mandList = [];
	}
}


document.getElementById('fileInput').addEventListener('change', function(event) {
	window.setTimeout(() => {
		var element = document.getElementById("a1");
		try {
			element.parentNode.removeChild(element);
		} catch(err) {
		
		}
	}, "10");

	let file = event.target.files[0];
	const reader = new FileReader();

	reader.onload = function(event) {
		const fileContent = event.target.result;
		const lines = fileContent.split('\n');
		
		let par = document.getElementById('fileName');
		par.innerHTML = "Pasirinktas failas: " + file.name;
		
		let isDone = document.getElementById('isDone');
		isDone.innerHTML = "Įrodymai verifikuojami...";
		deleteFromDatabase(lines);
	};
	reader.readAsText(file);
});

function openDatabase(callback) {
    let request = indexedDB.open('ProofDatabase', 1);

    request.onupgradeneeded = function(event) {
        let db = event.target.result;
        if (!db.objectStoreNames.contains('proofs')) {
            let store = db.createObjectStore('proofs', { keyPath: 'id' });
			store.createIndex('label', 'label', { unique: true} );
        }
    };

    request.onsuccess = function(event) {
        let db = event.target.result;
        callback(db);
    };

    request.onerror = function(event) {
        console.error('Database open error:', event.target.error);
    };
}

function deleteFromDatabase(lines) {
    openDatabase(function(db) {
        if (!db.objectStoreNames.contains('proofs')) {
            console.error("Object store 'proofs' does not exist");
            return;
        }

        let transaction = db.transaction('proofs', 'readwrite');

        transaction.oncomplete = function(event) {
            window.setTimeout(() => {
                try {            
                    main(lines);
                    addToDatabase(verifiedList);
                } catch (err) {
                    isDone.innerHTML = "Tikrinimo metu atsirado klaida. Ištaisykite failą arba įkelkite kitą.";
                    console.error(err);
                }
            }, 10);
        };

        transaction.onerror = function(event) {
            console.error('Transaction error:', event.target.error);
        };

        let store = transaction.objectStore('proofs');
        store.clear();
    });
}

function addToDatabase(verifiedList) {    
    openDatabase(function(db) {
        let transaction = db.transaction('proofs', 'readwrite');
        
        let store = transaction.objectStore('proofs');
        
        for (let i = 0; i < verifiedList.length; i++) {
            let data = { id: i, label: verifiedList[i].label, provingExpression: verifiedList[i].provingExpression, 
            resultList: verifiedList[i].resultList, subsDict: verifiedList[i].subsDict, mandList: verifiedList[i].mandList };
            let addRequest = store.add(data);
            
            addRequest.onerror = function(event) {
                console.error('Add request error:', event.target.error);
            };
        }
        
        transaction.oncomplete = function(event) {
            isDone.innerHTML = "Įrodymai sėkmingai verifikuoti. Spauskite mygtuką \"Pirmyn\", kad pasiekti teoremų sąrašą.";
            const div4 = document.getElementById("div4");
            let anchor = document.createElement('a');

            anchor.href = 'search.html';
            anchor.className = 'button';
            anchor.id = "a1";

            anchor.textContent = 'Pirmyn';
            div4.appendChild(anchor);
        };

        transaction.onerror = function(event) {
            console.error('Transaction error:', event.target.error);
        };
    });
}