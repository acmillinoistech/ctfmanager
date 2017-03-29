function main(fakeTeams){

	return new Promise((resolve, reject) => {

		var CONTEST_ID = 'clarity2017'; // prompt('Enter Contest ID.');

		var db = firebase.database();

		db.ref('ctf/' + CONTEST_ID + '/details').once('value', (snapshot) => {
			var contestName = document.getElementById('contest-name');
			contestName.innerText = snapshot.val().name;
		});

		db.ref('ctf/' + CONTEST_ID + '/teams').once('value', (teamSnap) => {

			db.ref('ctf/' + CONTEST_ID + '/flags').once('value', (flagSnap) => {

				db.ref('ctf/' + CONTEST_ID + '/submissions').on('value', (submissionSnap) => {

					var board = render(submissionSnap.val(), teamSnap.val(), flagSnap.val(), fakeTeams);

					var simulateSubmission = (teamId, flagId, submissionObj, timeOut) => {
						if(fakeTeams[teamId]){
							if(!fakeTeams[teamId].submissions[flagId]){
								fakeTeams[teamId].submissions[flagId] = [];
							}
							fakeTeams[teamId].submissions[flagId].push(submissionObj);
						}
						else{
							console.error('Invalid team id.');
						}
						setTimeout(() => {
							render(submissionSnap.val(), teamSnap.val(), flagSnap.val(), fakeTeams);
						}, timeOut || 0);
					}

					resolve({
						simulator: simulateSubmission,
						board: board
					});

				});

			});

		});

	});

}

function render(submissions, teamData, flags, fakeTeams){

	// Room to Add Sample Teams:

	if(fakeTeams){
		for(var ft in fakeTeams){
			var fake = fakeTeams[ft];
			submissions[ft] = fake.submissions;
			teamData[ft] = {name: fake.name};
		}
	}

	var teamList = getTeamList(submissions, flags, teamData);
	var board = renderScoreBoard(teamList, flags);
	var scoreBoard = document.getElementById('score-board')
	scoreBoard.replaceChild(board, scoreBoard.children[0]);

	return board;

}


function on(node, event, fn){
	node.addEventListener(event, fn);
}

function getTeamList(teams, flags, teamData){
	function countNonZeroScores(map){
		return Object.keys(map).map(k => map[k]).filter(m => m !== 0).length;
	}
	return Object.keys(teamData).filter(t => teamData[t] ? true : false).map(t => {

		var team = teams[t] || {};
		var total = 0;
		var scores = {};

		for(var f in flags){
			var correct = false;
			var attempts = team[f] || [];
			Object.keys(attempts).forEach(aid => {
				var s = team[f][aid];
				if(s.correct){
				//if(s.answer === flags[f].answer){
					correct = true;
				}
			});
			var score = correct ? parseInt(flags[f].points, 10) : 0;
			total += score;
			scores[f] = score;
		}

		return {
			details: teamData[t],
			total: total,
			scores: scores
		}

	}).sort((a, b) => {
		if(a.total === b.total){
			return b.total - a.total;
		}
		else{
			return countNonZeroScores(b.scores) - countNonZeroScores(a.scores);
		}
	});
}

function renderScoreBoard(teamList, flags){
	var board = document.createElement('table');

	var header = document.createElement('tr');
	var labels = ['Rank', 'Team', 'Points'];
		labels.forEach(l => {
			var th = document.createElement('th');
			th.innerText = l;
			header.appendChild(th);
		});
	var codes = Object.keys(flags);
		codes.forEach(c => {
			var th = document.createElement('th');
			th.innerText = flags[c].code;
			header.appendChild(th);
		});
	board.appendChild(header);

	for(var t = 0; t < teamList.length; t++){

		var team = teamList[t];

		var row = document.createElement('tr');
		var content = ['Rank', 'Team', 'Points'];

		var rank = document.createElement('p');
			rank.innerText = (t+1);
			content[0] = rank;

		var teamName = document.createElement('p');
			teamName.innerText = team.details.name;
			content[1] = teamName;

		var totalScore = document.createElement('p');
			totalScore.innerText = team.total;
			content[2] = totalScore;

		var codeScores = codes.map(fid => team.scores[fid]).map(score => {
			var node = document.createElement('p');
			node.innerText = score || 0;
			return node;
		});
		content.push.apply(content, codeScores);

		content.forEach(c => {
			var cell = document.createElement('td');
			cell.appendChild(c);
			row.appendChild(cell);
		});
		board.appendChild(row);
	}

	return board;
}