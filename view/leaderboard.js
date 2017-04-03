function main(renderDiffs, fakeTeams){

	return new Promise((resolve, reject) => {

		var CONTEST_ID = 'clarity2017'; // prompt('Enter Contest ID.');

		var db = firebase.database();

		db.ref('ctf/' + CONTEST_ID + '/details').once('value', (snapshot) => {
			var contestName = document.getElementById('contest-name');
			contestName.innerText = "Leaderboard: " + snapshot.val().name;
		});

		db.ref('ctf/' + CONTEST_ID + '/teams').once('value', (teamSnap) => {

			db.ref('ctf/' + CONTEST_ID + '/flags').once('value', (flagSnap) => {

				db.ref('ctf/' + CONTEST_ID + '/submissions').on('value', (submissionSnap) => {

					var board = render(submissionSnap.val(), teamSnap.val(), flagSnap.val(), renderDiffs, fakeTeams);

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
						return new Promise((resSim, rejSim) => {
							setTimeout(() => {
								var board = render(submissionSnap.val(), teamSnap.val(), flagSnap.val(), renderDiffs, fakeTeams);
								resSim(board);
							}, timeOut || 0);
						});
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

var oldTeamList = false;

function render(submissions, teamData, flags, renderDiffs, fakeTeams){

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
	//board.className("striped")
	var scoreBoard = document.getElementById('score-board')
	scoreBoard.replaceChild(board, scoreBoard.children[0]);
	//var table = document.getElementById('score-board').children[0]
	//table.className = "bordered responsive-table"

	if(renderDiffs){
		if(oldTeamList){
			var teamDiffs = getTeamDiffs(oldTeamList, teamList);
				renderDiffs(teamDiffs);
		}
		oldTeamList = teamList;
	}

	return board;

}

function getTeamDiffs(oldList, nowList){

	var getKey = item => item.details.id;
	var addRank = (item, idx) => {
		item.rank = (idx + 1);
		return item;
	}

	var oldTeams = listToObj(oldList, getKey, addRank);
	var nowTeams = listToObj(nowList, getKey, addRank);

	var diffs = [];

	for(var t in nowTeams){
		var now = nowTeams[t];
		var old = oldTeams[t];
		if(now && old){
			if(now.rank !== old.rank){
				diffs.push({
					type: 'rank',
					team: t,
					before: old.rank,
					after: now.rank
				});
			}
			for(var f in now.scores){
				var ns = now.scores[f];
				var os = old.scores[f];
				var na = now.attempts[f];
				var oa = old.attempts[f];
				if(ns !== os || na !== oa){
					console.log(t, f, os, '->', ns);
					diffs.push({
						type: 'attempt',
						team: t,
						flag: f,
						before: os,
						after: ns
					});
				}
			}
		}
	}

	return diffs;

}

function listToObj(list, key, transform){
	var obj = {};
	list.forEach((item, idx) => {
		obj[key(item, idx)] = transform(item, idx);
	});
	return obj;
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
		var attempts = {};

		for(var f in flags){
			var correct = false;
			var submissions = team[f] || [];
				attempts[f] = 0;
			Object.keys(submissions).forEach(aid => {
				attempts[f]++;
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

		teamData[t].id = t;

		return {
			details: teamData[t],
			total: total,
			scores: scores,
			attempts: attempts
		}

	}).sort((a, b) => {
		if(a.total === b.total){
			return countNonZeroScores(b.scores) - countNonZeroScores(a.scores);
		}
		else{
			return b.total - a.total;
		}
	});
}

// function renderScoreBoard(teamList, flags){
// 	var board = document.createElement('table');

// 	var header = document.createElement('thead'); //tr
// 	var labels = ['Rank', 'Team', 'Points'];
// 		labels.forEach(l => {
// 			var th = document.createElement('th');
// 			th.innerText = l;
// 			header.appendChild(th);
// 		});
// 	var codes = Object.keys(flags);
// 		codes.forEach(c => {
// 			var th = document.createElement('th');
// 			th.innerText = flags[c].code;
// 			header.appendChild(th);
// 		});
// 	board.appendChild(header);

// 	var body = document.createElement('tbody');

// 	for(var t = 0; t < teamList.length; t++){

// 		var team = teamList[t];

// 		var row = document.createElement('tr');
// 			row.dataset.team = team.details.id;
// 		var content = ['Rank', 'Team', 'Points'];

// 		var rank = document.createElement('p');
// 			rank.innerText = (t+1);
// 			content[0] = rank;

// 		var teamName = document.createElement('p');
// 			teamName.innerText = team.details.name;
// 			content[1] = teamName;

// 		var totalScore = document.createElement('p');
// 			totalScore.innerText = team.total;
// 			content[2] = totalScore;

// 		var codeScores = codes.map(fid => {
// 			return {
// 				flag: fid,
// 				score: team.scores[fid]
// 			}
// 		}).map(code => {
// 			var node = document.createElement('p');
// 				node.dataset.flag = code.flag;
// 				node.innerText = code.score || 0;
// 			return node;
// 		});
// 		content.push.apply(content, codeScores);

// 		content.forEach(c => {
// 			var cell = document.createElement('td');
// 			cell.appendChild(c);
// 			row.appendChild(cell);
// 		});
// 		body.appendChild(row);
// 	}

// 	board.appendChild(body);

// 	return board;
// }

function renderScoreBoard(teamList, flag) {
	
	var board = document.createElement('div');
	
	for (var i = 0; i < teamList.length; i++) {
		var cardHorizontal = document.createElement('div')
			cardHorizontal.className = "card horizontal row valign-wrapper";
			cardHorizontal.id = teamList[i].details.id
			cardHorizontal.style.margin = "0.5%"
		var cardStacked = document.createElement('div')
			cardStacked.className = "card-stacked";
		var cardContent = document.createElement('div')
			cardContent.className = "card-content";
		
		// var img = document.createElement('img');
		// 	img.src = "https://upload.wikimedia.org/wikipedia/commons/4/49/Koala_climbing_tree.jpg"
		// 	img.className = "circle responsive-img"
		// 	img.width = "90"
		// 	img.height = "90"

		var rank = document.createElement('p');
			rank.innerText = i + 1
			rank.style.fontWeight = "800"
			rank.style.fontSize = "25px"

		var rankWrap = document.createElement('div');
			rankWrap.className = "col s1 center-align"
		
		var teamName = document.createElement('p');
			teamName.style.fontWeight = "600"
			teamName.innerText = teamList[i].details.name;
		
		var scoreBarP = document.createElement('span');
			scoreBarP.className = "progress"
			scoreBarP.style.height = "10px"
		var scoreBar = document.createElement('span');
			scoreBar.className = "determinate deep-orange"
			scoreBar.style.width = ((teamList[i].total / teamList[0].total) * 100) + '%'

		var score = document.createElement('span');
			score.innerHTML = 'Score: ' + teamList[i].total;

		scoreBarP.appendChild(scoreBar)
		rankWrap.appendChild(rank)

		cardContent.appendChild(teamName)
		cardContent.appendChild(score)
		cardContent.appendChild(scoreBarP)
		
		cardStacked.appendChild(cardContent)
		
		cardHorizontal.appendChild(rankWrap)
		cardHorizontal.appendChild(cardStacked)
		
		board.appendChild(cardHorizontal)
	}

	return board
}