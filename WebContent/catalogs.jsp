			<div id="top-control">
				<h2>
					<img src="WebProgPic/katalog.png" alt=""> Kataloge
				</h2>
				<%
					for (Map.Entry<String, Catalog> cEntry : cMap.entrySet()) {
						String cName = cEntry.getKey();
						out.print("<div class='button'>"+cName.substring(0, cName.indexOf('.'))+"</div>");

					}
				%>
			</div>