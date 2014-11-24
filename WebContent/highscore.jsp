			<div id="bot-control">
				<h2>
					<img src="WebProgPic/highscore.png" alt=""> Highscore
				</h2>
				<table id="table1">
					<thead>
						<tr>
							<td>Player
								<hr />
							</td>
							<td>Score
								<hr />
							</td>
						</tr>
					</thead>
					<tbody>
						<%
							for (Player player : quiz.getPlayerList()) {
								out.print("<tr><td>" + player.getName().replace('<', ' ') + "</td><td>"
										+ Long.toString(player.getScore()) + "</td></tr>");
							}
						%>
					</tbody>
				</table>
			</div>
					