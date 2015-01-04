YUI().use('jsonp', 'jsonp-url', 'node', 'node-base', function (Y) {
	//Define JSONP urls
	var aurl = 'https://qa.custhelp.com/cc/fleet/account?callback=JSON_CALLBACK';
	var rurl = 'https://qa.custhelp.com/cc/fleet/release?callback=JSON_CALLBACK';
			
	//Accounts JSONP, create alphabetically sorted QA list from it, and populate qaList field options
	function accountJSONP(response) {
		var engineers = response.nodes;
		var qaEngineers = [];
			if (engineers) {
				for (var i=0; i<engineers.length; i++) {
					if (engineers[i].CustomFields$SCRUM$Role$LookupName === 'QA') {
						qaEngineers.push(engineers[i]['LookupName']);
					}
				}
					
				qaEngineers.sort();
				for (var i=0; i<qaEngineers.length; i++) {	
					var qaEngineer = qaEngineers[i];
					var qaEngineerList = Y.Node.create('<option value="' + qaEngineer +'">' + qaEngineer + '</option>');
					Y.one('#qaList').append(qaEngineerList);					
				}
			}		
	}
	
	//Release JSONP and populate releaseList field options
	function releaseJSONP(response) {
		var releases = response.nodes;
			if (releases) {
				for (var i=0; i<releases.length; i++) {
					var releaseName = releases[i].LookupName;
					var releaseNameList = Y.Node.create('<option value="' + releaseName +'">' + releaseName + '</option>');
					Y.one('#releaseList').append(releaseNameList);					
				}
			}
	}
	
	//Form submit JSONP and table creation if results returned
	function resultsJSONP(response) {
		var results = response.nodes;
		
		//Check for existing results and remove if they exist for clean results slate
		if (Y.one('#resultsList')) {
			Y.one('#output').removeChild(Y.one('#resultsList'));
			}
		
		//Table resultsReturned created if results are returned else noResults returned
		if (results.length > 1 ) {
			var resultsTable = Y.Node.create('<div id="resultsList"><table id="resultsReturned"><tr><th>Reference Number</th><th>Subject</tr></table></div>');
			Y.one('#output').append(resultsTable);
			for (var i=0; i<results.length; i++) {
				var subject = results[i].Subject;
				var reference = results[i]["Reference #"];
				var referenceColumn = '<td><a href="https://qa.custhelp.com/app/zoombox/incident/refno/' + reference + '">' + reference + '</a></td>';
				var subjectColumn = '<td>' + subject + '</td>';
				var resultRow = '<tr id="result_' + i + '">' + referenceColumn + subjectColumn + '</tr>';
				var row = Y.Node.create(resultRow);
				Y.one('#resultsReturned').append(row);
			}
		} else {
			var noResults = Y.Node.create('<div id="resultsList"><h3 id="noResultsReturned">No incidents are either CNA or FNV for the specified QA and release.</h3></div>');
			Y.one('#output').append(noResults);
		}
	}
			
	//Get qa accounts and releases
	var accounts = new Y.JSONPRequest(aurl, accountJSONP);
	accounts.send();
	var releases = new Y.JSONPRequest(rurl, releaseJSONP);
	releases.send();
	
	//Handle form selections and submit
	var form = Y.one('#reportSelectors');
		form.on('submit', function(evt) {
			var selectedQA = encodeURI(Y.one('#qaList').get('value'));
			var selectedRelease = encodeURI(Y.one('#releaseList').get('value'));
			var report = 'https://qa.custhelp.com/cc/fleet/report/165629?Status=111,3,110&Account=';
			report += selectedQA + '&TBII=' + selectedRelease + '&callback=JSON_CALLBACK';
			var incidents = new Y.JSONPRequest(report, resultsJSONP);
			incidents.send();
			evt.preventDefault();
		});
	 
});


