var CONTEST_ID = 'clarity2017'; // prompt('Enter Contest ID.');

var db = firebase.database();

db.ref('ctf/' + CONTEST_ID + '/flags').on('value', (snapshot) => {
	var flags = snapshot.val();
	console.log(flags);
	var board = renderFlagBoard(flags);
	var flagBoard = document.getElementById('flag-board')
	flagBoard.replaceChild(board, flagBoard.children[0]);
});

db.ref('ctf/' + CONTEST_ID + '/details').once('value', (snapshot) => {
	var contestName = document.getElementById('contest-name');
	contestName.innerText = snapshot.val().name;
});

function on(node, event, fn){
	node.addEventListener(event, fn);
}

function updateFlagCode(e){
	var code = e.target.value;
	var flagid = e.target.dataset.flagid;
	console.log('Update Name to: ' + code);
	db.ref('ctf/' + CONTEST_ID + '/flags/' + flagid).once('value', (snapshot) => {
		var flag = snapshot.val();
			flag.code = code;
		var prom = db.ref('ctf/' + CONTEST_ID + '/flags/' + code).set(flag);
		prom.then(d => {
			db.ref('ctf/' + CONTEST_ID + '/flags/' + flagid).remove();
		});
	});
}

function updateFlagName(e){
	var name = e.target.value;
	var flagid = e.target.dataset.flagid;
	console.log('Update Name to: ' + name);
	db.ref('ctf/' + CONTEST_ID + '/flags/' + flagid + '/name').set(name);
}

function updateFlagDescription(e){
	var desc = e.target.value;
	var flagid = e.target.dataset.flagid;
	console.log('Update Description to: ' + desc);
	db.ref('ctf/' + CONTEST_ID + '/flags/' + flagid + '/description').set(desc);
}

function updateFlagLink(e){
	var link = e.target.value;
	var flagid = e.target.dataset.flagid;
	console.log('Update Link to: ' + link);
	db.ref('ctf/' + CONTEST_ID + '/flags/' + flagid + '/link').set(link);
}

function updateFlagPoints(e){
	var points = e.target.value;
	var flagid = e.target.dataset.flagid;
	console.log('Update Points to: ' + points);
	db.ref('ctf/' + CONTEST_ID + '/flags/' + flagid + '/points').set(points);
}

function updateFlagAnswer(e){
	var answer = e.target.value;
	var flagid = e.target.dataset.flagid;
	console.log('Update Answer to: ' + answer);
	db.ref('ctf/' + CONTEST_ID + '/flags/' + flagid + '/answer').set(answer);
}

function removeFlag(e){
	var flagid = e.target.dataset.flagid;
	db.ref('ctf/' + CONTEST_ID + '/flags/' + flagid).remove();
}

function renderFlagBoard(flags){
	var board = document.createElement('table');

	var header = document.createElement('tr');
	var labels = ['Code', 'Name', 'Description', 'Link', 'Points', 'Answer', 'Remove'];
		labels.forEach(l => {
			var th = document.createElement('th');
			th.innerText = l;
			header.appendChild(th);
		});
	board.appendChild(header);

	for(var f in flags){
		var flag = flags[f];
		var row = document.createElement('tr');
		var content = [];

		var code = document.createElement('input')
			code.type = 'text';
			code.value = flag.code;
			code.dataset.flagid = f;
			on(code, 'change', updateFlagCode);
			content.push(code);

		var name = document.createElement('input');
			name.type = 'text';
			name.value = flag.name;
			name.dataset.flagid = f;
			on(name, 'change', updateFlagName);
			content.push(name);

		var desc = document.createElement('textarea');
			desc.value = flag.description;
			desc.dataset.flagid = f;
			on(desc, 'change', updateFlagDescription);
			content.push(desc);

		var link = document.createElement('input');
			link.type = 'text';
			link.value = flag.link;
			link.dataset.flagid = f;
			on(link, 'change', updateFlagLink);
			content.push(link);

		var points = document.createElement('input');
			points.type = 'number';
			points.value = flag.points;
			points.dataset.flagid = f;
			on(points, 'change', updateFlagPoints);
			content.push(points);

		var answer = document.createElement('input');
			answer.type = 'text';
			answer.value = flag.answer;
			answer.dataset.flagid = f;
			on(answer, 'change', updateFlagAnswer);
			content.push(answer);

		var remove = document.createElement('button');
			remove.innerText = 'x';
			remove.dataset.flagid = f;
			on(remove, 'click', removeFlag);
			content.push(remove);

		content.forEach(c => {
			var cell = document.createElement('td');
			cell.appendChild(c);
			row.appendChild(cell);
		});
		board.appendChild(row);
	}

	return board;
}

var addFlag = document.getElementById('add-flag');
on(addFlag, 'click', (e) => {
	db.ref('ctf/' + CONTEST_ID + '/flags').push({
		code: 'X0',
		name: 'New Challenge',
		description: 'None.',
		link: false,
		points: 0,
		answer: 'None'
	});
});

db.ref('ctf/' + CONTEST_ID + '/teams').on('value', (snapshot) => {
	var teams = snapshot.val();
	var board = renderTeamBoard(teams);
	var teamBoard = document.getElementById('team-board')
	teamBoard.replaceChild(board, teamBoard.children[0]);
});

function updateTeamSecret(e){
	var secret = e.target.value;
	var teamid = e.target.dataset.teamid;
	console.log('Update Team Secret to: ' + secret);
	db.ref('ctf/' + CONTEST_ID + '/teams/' + teamid).once('value', (snapshot) => {
		var team = snapshot.val();
		var prom = db.ref('ctf/' + CONTEST_ID + '/teams/' + secret).set(team);
		prom.then(d => {
			db.ref('ctf/' + CONTEST_ID + '/teams/' + teamid).remove();
		});
	});
}

function updateTeamName(e){
	var name = e.target.value;
	var teamid = e.target.dataset.teamid;
	console.log('Update Team Name to: ' + name);
	db.ref('ctf/' + CONTEST_ID + '/teams/' + teamid + '/name').set(name);
}

function removeTeam(e){
	var teamid = e.target.dataset.teamid;
	db.ref('ctf/' + CONTEST_ID + '/teams/' + teamid).remove();
}

function renderTeamBoard(teams){
	var board = document.createElement('table');

	var header = document.createElement('tr');
	var labels = ['Name', 'Secret Key', 'Remove'];
		labels.forEach(l => {
			var th = document.createElement('th');
			th.innerText = l;
			header.appendChild(th);
		});
	board.appendChild(header);

	for(var t in teams){
		var team = teams[t];
		var row = document.createElement('tr');
		var content = [];

		var name = document.createElement('input')
			name.type = 'text';
			name.value = team.name;
			name.dataset.teamid = t;
			on(name, 'change', updateTeamName);
			content.push(name);

		var secret = document.createElement('input')
			secret.type = 'text';
			secret.value = t;
			secret.dataset.teamid = t;
			on(secret, 'change', updateTeamSecret);
			content.push(secret);

		var remove = document.createElement('button');
			remove.innerText = 'x';
			remove.dataset.teamid = t;
			on(remove, 'click', removeTeam);
			content.push(remove);

		content.forEach(c => {
			var cell = document.createElement('td');
			cell.appendChild(c);
			row.appendChild(cell);
		});
		board.appendChild(row);
	}

	return board;
}

var addTeam = document.getElementById('add-team');
on(addTeam, 'click', (e) => {
	db.ref('ctf/' + CONTEST_ID + '/teams').push({
		name: 'New Team'
	});
});