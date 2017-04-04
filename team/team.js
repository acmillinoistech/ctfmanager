function main(teamKey){

var CONTEST_ID = 'clarity2017'; // prompt('Enter Contest ID.');
var TEAM_ID = teamKey;
var db = firebase.database();
var CTF_URL = 'http://acm-sinatra-vingkan.c9users.io/submission/';
var currentRef = false;
var currentListener = false;

TEAM_ID = '-KgIunYPz9HUOTUcKjU7';

getFlags().then(list => {
	renderFlagPane(list);
	var code = list[0].code;
	var x = document.querySelector('[data-flag="' + code + '"]');
	x.click();
});

function getSubmissionListener(teamid, flagid){
	var ref = db.ref('ctf/' + CONTEST_ID + '/submissions/' + teamid + '/' + flagid);
	return ref;
}

function getFlagData(flagid){
	return new Promise((resolve, reject) => {
		var ref = db.ref('ctf/' + CONTEST_ID + '/flags/' + flagid);
		ref.once('value', snapshot => {
			var data = snapshot.val();
			resolve(data);
		});
	});
}

function postSubmission(teamid, flagid, text){
	if(teamid && flagid && text){
		return new Promise((resolve, reject) => {
			$.post(CTF_URL + flagid, {
				team: teamid,
				answer: text
			}).then((res) => {
				resolve(res);
			});
		});
	}
	else{
		alert('No content.');
	}
}

function getFlags(){
	return new Promise((resolve, reject) => {
		var ref = db.ref('ctf/' + CONTEST_ID + '/flags');
		ref.once('value', snapshot => {
			var flagSnap = snapshot.val();
			var list = Object.keys(flagSnap).map(key => {
				return flagSnap[key];
			}).sort((a, b) => {
				return a.code.localeCompare(b.code);
			});
			resolve(list);
		});
	});
}

function renderFlagPane(list){
	var pane = document.getElementById('flag-pane');
		pane.innerHTML = '';
	for(var i = 0; i < list.length; i++){
		var flag = list[i];
		var div = document.createElement('div');
		div.innerText = 'Flag ' + flag.code;
		div.dataset.flag = flag.code;
		div.classList.add('flag-nav');
		div.addEventListener('click', e => {
			var flag = e.target.dataset.flag;
			showSubmissionPane(TEAM_ID, flag);
			var divs = document.getElementsByClassName('flag-nav');
			for(var j = 0; j < divs.length; j++){
				divs[j].classList.remove('active');
			}
			e.target.classList.add('active');
		});
		pane.appendChild(div);
	}
	return pane;
}

function showSubmissionPane(teamid, flagid){
	var ref = getSubmissionListener(teamid, flagid);
	if(currentRef && currentListener){
		currentRef.off('value', currentListener);
	}
	getFlagData(flagid).then(data => {
		var listener = ref.on('value', snapshot => {
			var submissions = snapshot.val();
			if(submissions){
				var list = Object.keys(submissions).map(key => {
					return submissions[key];
				}).sort((a, b) => {
					var ad = new Date(a.timestamp).getTime();
					var bd = new Date(b.timestamp).getTime();
					return bd - ad;
				});
				renderSubmissionPane(list, data);
			}
			else{
				renderSubmissionPane([], data);
			}
		});
		currentRef = ref;
		currentListener = listener;
	});
}

function renderSubmissionPane(list, flag){
	var pane = document.getElementById('submission-pane');
		pane.innerHTML = '';
	var hf = document.createElement('h5');
		hf.innerText = 'Flag ' + flag.code;
	var h = document.createElement('h3');
		h.innerText = flag.name;
	var p = document.createElement('p');
		p.innerText = flag.description;
		pane.appendChild(hf);
		pane.appendChild(h);
		pane.appendChild(p);
	if(flag.link){
		var a = document.createElement('a');
			a.href = flag.link;
			a.target = '_blank';
			a.innerText = 'View Flag on GitHub';
			pane.appendChild(a);
	}
	if(flag.answer === 'TYPE::JUDGED'){
		var form = document.createElement('div');
			form.classList.add('submission-form');
		var ha = document.createElement('h5');
			ha.innerText = 'Submission Form';
		var password = document.createElement('input');
			password.type = 'password';
			password.placeholder = 'Team Secret Key';
		var textarea = document.createElement('textarea');
			textarea.dataset.flag = flag.code;
			textarea.classList.add('materialize-textarea');
		var button = document.createElement('button');
			button.innerText = 'Submit';
			button.classList.add('btn', 'waves-effect', 'waves-light');
		button.addEventListener('click', e => {
			var ps = password.value;
			var tx = textarea.value;
			var fi = textarea.dataset.flag;
			postSubmission(ps, fi, tx);
		});
		form.appendChild(ha);
		form.appendChild(password);
		form.appendChild(textarea);
		form.appendChild(button);
		pane.appendChild(form);
	}
	var hb = document.createElement('h5');
		hb.innerText = 'Past Submissions';
		pane.appendChild(hb);
	if(list.length > 0){
		for(var i = 0; i < list.length; i++){
			var res = list[i];
			var div = document.createElement('div');
			var time = moment(res.timestamp).format('hh:mm A');
			var pre = document.createElement('pre');
				pre.innerText = res.answer;
			var pd = document.createElement('p');
				var s1 = document.createElement('span');
					s1.innerText = res.correct ? 'Correct' : 'Incorrect';
					var sClass = res.correct ? 'correct' : 'incorrect';
					s1.classList.add(sClass);
				var s2 = document.createElement('span');
					s2.innerText = time;
				pd.appendChild(s1);
				pd.appendChild(s2);
				div.appendChild(pd);
				div.appendChild(pre);
				pane.appendChild(div);
		}
	}
	else{
		var div = document.createElement('div');
			div.innerText = 'No submissions yet.'
			pane.appendChild(div);
	}
	return pane;
}

}