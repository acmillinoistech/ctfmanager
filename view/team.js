var CONTEST_ID = 'clarity2017'; // prompt('Enter Contest ID.');
var TEAM_ID = false;
var db = firebase.database.ref();
var CTF_URL = 'http://acm-sinatra-vingkan.c9users.io/submission/';

function getSubmissionListener(teamid, flagid){
	var ref = db.ref('ctf/' + CONTEST_ID + '/submissions/' + teamid + '/' + flagid);
	return ref;
}

function postSubmission(teamid, flagid, text){
	return new Promise((resolve, reject) => {
		$.post(CTF_URL + flagid, {
			team: teamid,
			answer: text
		}).then((res) => {
			resolve(res);
		});
	});
}

function getFlags(){
	var ref = db.ref('ctf/' + CONTEST_ID + '/flags');
	ref.once('value', snapshot => {
		var flagSnap = snapshot.val();
		var list = Object.keys(flagSnap).map(key => {
			return flagSnap[key];
		}).sort((a, b) => {
			return a.code.localeCompare(b);
		});
		resolve(list);
	});
}

function renderFlagPane(list){
	var pane = document.getElementById('flag-pane');
		pane.innerHTML = '';
	for(var i = 0; i < list.length; i++){
		var flag = list[i];
		var div = document.createElement('div');
		div.innerText = flag.name;
		div.dataset.flag = flag.code;
		div.addEventListener('click', e => {
			var flag = e.target.dataset.flag;
			showSubmissionPane(TEAM_ID, flag);
		});
		pane.appendChild(div);
	}
	return pane;
}

function showSubmissionPane(teamid, flagid){
	var ref = getSubmissionListener(teamid, flagid);
	ref.on('value', snapshot => {
		var submissions = snapshot.val();
		var list = Object.keys(submissions).map(key => {
			return submissions[key];
		}).sort((a, b) => {
			return b.timestamp - a.timestamp;
		});
		renderSubmissionPane(list);
	})
}

function renderSubmissionPane(list){
	var pane = document.getElementById('submission-pane');
		pane.innerHTML = '';
	for(var i = 0; i < list.length; i++){
		var flag = list[i];
		var div = document.createElement('div');
		var time = moment(flag.timestamp).format('hh:mm A');
		var flagString = time + ': ' + flag.answer;
		div.innerText = flagString;
		pane.appendChild(div);
	}
	return pane;
}