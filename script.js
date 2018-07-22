var BASE_URL =  'http://127.0.0.1:10080/util-aligner';
var DATABASE = '/database';
var NETWORKS = '/networks';
var ALIGNERS = '/aligner';
var SUBMIT = '/create-job';
var proteins_1 = [];
var proteins_2 = [];
var network_1 = null;
var network_2 = null;

window.onload = () => {
	getInitialData();
	var button = document.querySelector('#send');
	$('#div-db').on('change', function(){
		db = document.querySelector('#db');
		if (db.value != '') {
			getNetworks()
		}
	})

	$('#div-net-1').on('change', function(){
		db = document.querySelector('#autocomplete');
		if (db.value === "Personalized Network") document.querySelector('#file-selector-1').className = "file-field input-field col s6";
		else document.querySelector('#file-selector-1').className = "file-field input-field col s6 hide";
	})
	$('#div-net-1').on('click', function(){
		db = document.querySelector('#autocomplete');
		if (db.value === "Personalized Network") document.querySelector('#file-selector-1').className = "file-field input-field col s6";
		else document.querySelector('#file-selector-1').className = "file-field input-field col s6 hide";
	})

	$('#div-net-2').on('change', function(){
		db = document.querySelector('#autocomplete-2');
		if (db.value === "Personalized Network") document.querySelector('#file-selector-2').className = "file-field input-field col s6";
		else document.querySelector('#file-selector-2').className = "file-field input-field col s6 hide";
	})
	$('#div-net-2').on('click', function(){
		db = document.querySelector('#autocomplete-2');
		if (db.value === "Personalized Network") document.querySelector('#file-selector-2').className = "file-field input-field col s6";
		else document.querySelector('#file-selector-1').className = "file-field input-field col s6 hide";
	})

	$('#file-net-1').on('change', function(){
		getCSVFile('#file-net-1')
	})
	$('#file-net-2').on('change', function(){
		getCSVFile('#file-net-2')
	})
	
	button.onclick = submitForm;
}


  

function getInitialData() {
	fetch(`${BASE_URL}${DATABASE}`)
		.then((res) => res.json())
		.then((data) => {
			const databases = data.data;
			select = document.querySelector('#db');
			for (var data in databases){
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
			for (var data in aligners){
				var opt = document.createElement('option');
				opt.value = aligners[data];
				opt.innerHTML = aligners[data];
				select.appendChild(opt);
			};
		
			$(document).ready(function() {
				$('select').material_select();
			});
		
		})
		.catch(err => console.log('[ ERROR ]', err));

}

function getNetworks() {
	var db = document.querySelector('#db');
	db_name = db.value
	fetch(`${BASE_URL}${NETWORKS}/${db_name}`)
	.then((res) => res.json())
	.then((data) => {
		const networks = data.data;
		var processed_networks = {"Personalized Network": null}
		for (var data in networks){
			processed_networks[networks[data]] = null;
		};
		$(document).ready(function() {
			//$('.modal').modal();
			  $('select').material_select();
			  $('input.autocomplete').autocomplete('updateData', {data:{}});
			  console.log('1', processed_networks);
			});
			$(document).ready(function() {
			//$('.modal').modal();
			  $('select').material_select();
			  $('input.autocomplete').autocomplete({
			data: processed_networks
		  });
		  console.log(processed_networks);
		});
		$(document).ready(function() {
			$('select').material_select();
			$('input.autocomplete-2').autocomplete({
				data: processed_networks})
		});
		$(document).ready(function() {
			$('select').material_select();
		});
	}).catch(err => console.log('[ ERROR ]', err));
}

function getCSVFile(selector) {
	const file = document.querySelector(selector).files[0];
	if (!file) return Materialize.toast('You need to select a file', 4000);
	const reader = new FileReader();
	reader.readAsText(file);
	reader.onload = selector === '#file-net-1' ? this.loadHandler_1 : this.loadHandler_2;
	reader.onerror = this.errorHandler;
	return reader;
  }

function loadHandler_1(event) {
	var csv = event.target.result;
	processData('net_1', csv);
  }

function loadHandler_2(event) {
	var csv = event.target.result;
	processData('net_2', csv);
  }

function processData(net, csv) {
	const lines = csv.split(/\r\n|\n/)
	net === 'net_1' ? proteins_1 = lines : proteins_2 = lines;
  }

function submitForm() {
	var db = document.querySelector('#db').value;
	var net1 = document.querySelector('#autocomplete').value;
	var net2 = document.querySelector('#autocomplete-2').value;
	var aligner = document.querySelector('#aligner').value;
	var mail = document.querySelector('#mail').value;
	const payload = {
		db,
		net1,
		net2,
		aligner,
		mail
	}
	if (net1 === 'Personalized Network') {
		payload.proteins_1 = proteins_1;
	}
	if (net2 === 'Personalized Network') {
		getCSVFile('#file-net-2');
		payload.proteins_2 = proteins_2;
	}
	fetch(`${BASE_URL}${SUBMIT}`,
		{
			method: "POST",
			body: JSON.stringify(payload),
			headers: {
				'Accept': 'application/json',
				'Content-Type': 'application/json'
			}
		}
	)
	.then((res) => res.json())
	.catch(err => console.log('[ ERROR ]', err));
	alert('Thank you for using PINAWEB. You will receive the results in your email.')
}
