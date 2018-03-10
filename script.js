var BASE_URL =  'http://127.0.0.1:10080/util-aligner';
var DATABASE = '/database';
var NETWORKS = '/networks';
var ALIGNERS = '/aligner';
var SUBMIT = '/create-job';


window.onload = () => {
	getInitialData();
	var db = document.querySelector('#db');
	console.log('[ db ]', db);
	db.onclick = getNetworks;
	var button = document.querySelector('#send');
	
	button.onclick = submitForm;
}


function getInitialData() {
	fetch(`${BASE_URL}${DATABASE}`)
		.then((res) => res.json())
		.then((data) => {
			const databases = data.data;
			select = document.querySelector('#db');
			console.log('[ databases ]', databases);
			for (var data in databases){
				console.log('[ data ]', databases[data])
				var opt = document.createElement('option');
				opt.value = databases[data];
				opt.innerHTML = databases[data];
				select.appendChild(opt);
			};
		})
		.catch(err => console.log('[ ERROR ]', err));
		fetch(`${BASE_URL}${ALIGNERS}`)
		.then((res) => res.json())
		.then((data) => {
			const aligners = data.data;
			select = document.querySelector('#aligner');
			console.log('[ aligners ]', aligners);
			for (var data in aligners){
				console.log('[ data ]', aligners[data])
				var opt = document.createElement('option');
				opt.value = aligners[data];
				opt.innerHTML = aligners[data];
				select.appendChild(opt);
			};
		})
		.catch(err => console.log('[ ERROR ]', err));


}

function getNetworks() {
	var db = document.querySelector('#db');
	db_name = db.selectedOptions[0].value
	fetch(`${BASE_URL}${NETWORKS}/${db_name}`)
	.then((res) => res.json())
	.then((data) => {
		const networks = data.data;
		select1 = document.querySelector('#net-1');
		while (select1.firstChild) {
			select1.removeChild(select1.firstChild);
		}
		var opt = document.createElement('option');
		opt.value = "";
		opt.innerHTML = "Choose an option";
		select1.appendChild(opt);

		select2 = document.querySelector('#net-2');

		while (select2.firstChild) {
			select2.removeChild(select2.firstChild);
		}
		var opt = document.createElement('option');
		opt.value = "";
		opt.innerHTML = "Choose an option";
		select2.appendChild(opt);

		console.log('[ networks ]', networks);
		for (var data in networks){
			console.log('[ network ]', networks[data])
			var opt = document.createElement('option');
			opt.value = networks[data];
			opt.innerHTML = networks[data];
			select1.appendChild(opt);
		};
		for (var data in networks){
			console.log('[ network ]', networks[data])
			var opt = document.createElement('option');
			opt.value = networks[data];
			opt.innerHTML = networks[data];
			select2.appendChild(opt);
		};
	}).catch(err => console.log('[ ERROR ]', err));
}
function submitForm() {
	var db = document.querySelector('#db').selectedOptions[0].value;
	var net1 = document.querySelector('#net-1').selectedOptions[0].value;
	var net2 = document.querySelector('#net-2').selectedOptions[0].value;
	var aligner = document.querySelector('#aligner').selectedOptions[0].value;
	var mail = document.querySelector('#mail').value;
	const payload = {
		db,
		net1,
		net2,
		aligner,
		mail
	}
	var data = new FormData()
	data.append( "json", JSON.stringify(payload));
	fetch(`${BASE_URL}${SUBMIT}`,
		{
			method: "POST",
			body: data
		}
	)
	.then((res) => res.json())
	.catch(err => console.log('[ ERROR ]', err));
	console.log(db, net1, net2, aligner, mail);
}
