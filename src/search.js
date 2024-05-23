const searchInput = document.querySelector(".searchInput");
const input = searchInput.querySelector("input");
const resultBox = searchInput.querySelector("#list");

const queryString = window.location.search;
const urlParams = new URLSearchParams(queryString);
const initial = urlParams.get('initial');
document.getElementById("header").href = initial;

let verifiedLabels = [];
let verifiedFinal = [];
let emptyArray = [];
let verifiedExpressions = [];

let request = indexedDB.open('ProofDatabase');


document.getElementById("container1").addEventListener("click", function() {
	window.location.href = initial;
});


request.onsuccess = function(event) {
	let db = event.target.result;
	
	let transaction = db.transaction('proofs', 'readonly');
	
	let objectStore = transaction.objectStore('proofs');
	
	let getRequest = objectStore.getAll();
	
	getRequest.onsuccess = function(event) {
		let data = event.target.result;
		if (data) {
			for (let i = 0; i < data.length; i++) {
				verifiedLabels.push(data[i].label);
				data[i].provingExpression.forEach((item, index) => { if (item == '|-') data[i].provingExpression[index] = '\u22A2'; });
				data[i].provingExpression = data[i].provingExpression.join(' ');
				verifiedFinal.push(data[i].provingExpression);
			}
			console.log(verifiedLabels);
		} else {
			console.error('No data found with the specified key', event.target.error);
		}
		
		const label = document.getElementById("label1");
		label.innerHTML = "";
		input.disabled = false;
		emptyArray = verifiedLabels.slice(0, 100).filter((data, index) => {
			verifiedExpressions.push(verifiedFinal[index]);
			return data;
		});
		emptyArray = emptyArray.map((data, index) => {
			return data = '<li id=' + data + '><a class="listProof" href=proof.html?q=' + data + '&initial=' + initial + '>' + data + ' ' + '<span >' + verifiedExpressions[index] + '</span>' + '</a></li>';
		});
		searchInput.classList.add("active");
		showSuggestions(emptyArray);
		let allList = resultBox.querySelectorAll("li");
		for (let i = 0; i < allList.length; i++) {
			allList[i].setAttribute("onclick", "this");
		}
	};
	
	transaction.oncomplete = function(event) {
		input.onkeyup = (e) => {
			let userData = e.target.value;
			emptyArray.length = 0;
			verifiedExpressions.length = 0;
			if (userData){
				emptyArray = verifiedLabels.filter((data, index) => {
					let check = data.toLocaleLowerCase().startsWith(userData.toLocaleLowerCase());
					if (check) {
						verifiedExpressions.push(verifiedFinal[index]);
					}
					return data.toLocaleLowerCase().startsWith(userData.toLocaleLowerCase()); 
				});
			} else {
				emptyArray = verifiedLabels.slice(0, 100).filter((data, index) => {
					verifiedExpressions.push(verifiedFinal[index]);
					return data;
				});
			}
			emptyArray = emptyArray.map((data, index) => {
				return data = '<li id=' + data + '><a class="listProof" href=proof.html?q=' + data + '&initial=' + initial + '>' + data + ' ' + '<span >' + verifiedExpressions[index] + '</span>' + '</a></li>';
			});
			searchInput.classList.add("active");
			showSuggestions(emptyArray);
			let allList = resultBox.querySelectorAll("li");
			for (let i = 0; i < allList.length; i++) {
				allList[i].setAttribute("onclick", "this");
			}
		}
	};
	
	transaction.onerror = function(event) {
		console.error('Transaction error:', event.target.error);
	};
};

function showSuggestions(list) {
    let listData;
    if (!list.length) {
        listData = '';
    } else {
        listData = list.join('');
    }
    resultBox.innerHTML = listData;
}

request.onerror = function(event) {
	console.error('Database open error:', event.target.error);
};
