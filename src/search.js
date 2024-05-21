const searchInput = document.querySelector(".searchInput");
const input = searchInput.querySelector("input");
const resultBox = searchInput.querySelector("#list");


let verifiedLabels = [];


function showSuggestions(list) {
    let listData;
    if(!list.length){
        listData = '';
    }else{
        listData = list.join('');
    }
    resultBox.innerHTML = listData;
}

document.getElementById("container1").addEventListener("click", function() {
	window.location.href = "index.html";
});

let request = indexedDB.open('ProofDatabase');
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
			}
		} else {
			console.error('No data found with the specified key', event.target.error);
		}
		
		const label = document.getElementById("label1");
		label.innerHTML = "";
		input.disabled = false;
	};
	
	transaction.oncomplete = function(event) {
		input.onkeyup = (e) => {
			let userData = e.target.value;
			let emptyArray = [];
			if(userData){
				emptyArray = verifiedLabels.filter((data) => {
					return data.toLocaleLowerCase().startsWith(userData.toLocaleLowerCase()); 
				});
				emptyArray = emptyArray.map((data) => {
					return data = '<li id=' + data + '><a class="listProof" href=proof.html?q=' + data + '>' + data +'</a></li>';
				});
				searchInput.classList.add("active");
				showSuggestions(emptyArray);
				let allList = resultBox.querySelectorAll("li");
				for (let i = 0; i < allList.length; i++) {
					allList[i].setAttribute("onclick", "this");
				}
			} else {
				searchInput.classList.remove("active");
			}
		}
	};
	
	transaction.onerror = function(event) {
		console.error('Transaction error:', event.target.error);
	};
};

request.onerror = function(event) {
	console.error('Database open error:', event.target.error);
};
