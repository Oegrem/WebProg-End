package de.fhwgt.quiz.loader;

import java.io.File;
import java.io.FileFilter;
import java.io.IOException;
import java.net.URISyntaxException;
import java.net.URL;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import javax.xml.parsers.DocumentBuilder;
import javax.xml.parsers.DocumentBuilderFactory;
import javax.xml.parsers.ParserConfigurationException;

import org.w3c.dom.Document;
import org.w3c.dom.Element;
import org.w3c.dom.Node;
import org.w3c.dom.NodeList;
import org.xml.sax.SAXException;

import de.fhwgt.quiz.application.Catalog;
import de.fhwgt.quiz.application.Question;

public class FilesystemLoader implements CatalogLoader {

	private File[] catalogDir;
	private final Map<String, Catalog> catalogs = new HashMap<String, Catalog>();
	private final String location;

	public FilesystemLoader(String location) {
		this.location = location;
	}

	@Override
	public Map<String, Catalog> getCatalogs() throws LoaderException {
		if (!catalogs.isEmpty()) {
			return catalogs;
		}

		// Construct URL for package location
		URL url = this.getClass().getClassLoader().getResource(location);
		File dir;
		try {
			// Make sure the Java package exists
			if (url != null) {
				dir = new File(url.toURI());
			} else {
				dir = new File("/");
			}
		} catch (URISyntaxException e) {
			// Try to load from the root of the classpath
			dir = new File("/");
		}
		
		// Add catalog files
		if (dir.exists() && dir.isDirectory()) {
			this.catalogDir = dir.listFiles(new CatalogFilter());
			for (File f : catalogDir) {
				catalogs.put(f.getName(), new Catalog(f.getName(),
						new QuestionFileLoader(f)));
			}
		}

		return catalogs;
	}

	@Override
	public Catalog getCatalogByName(String name) throws LoaderException {
		if (catalogs.isEmpty()) {
			getCatalogs();
		}

		return this.catalogs.get(name);
	}

	/**
	 * Filter class for selecting only files with a .xml extension.
	 *
	 * @author Simon Westphahl
	 *
	 */
	private class CatalogFilter implements FileFilter {

		/**
		 * Accepts only files with a .xml extension.
		 */
		@Override
		public boolean accept(File pathname) {
			if (pathname.isFile() && pathname.getName().endsWith(".xml"))
				return true;
			else
				return false;
		}

	}

	private class QuestionFileLoader implements QuestionLoader {

		private final File catalogFile;
		private final List<Question> questions = new ArrayList<Question>();

		public QuestionFileLoader(File file) {
			catalogFile = file;
		}

		@Override
		public List<Question> getQuestions(Catalog catalog)
				throws LoaderException {

			if (!questions.isEmpty()) {
				return questions;
			}
			/**/
			DocumentBuilderFactory dbFactory = DocumentBuilderFactory
					.newInstance();
			DocumentBuilder dBuilder = null;
			try {
				dBuilder = dbFactory.newDocumentBuilder();

				Document document;
				document = dBuilder.parse(catalogFile);

				NodeList nodeList = document.getElementsByTagName("Question");

				// Search the whole file for questions
				for (int c = 0; c < nodeList.getLength(); c++) {

					Node node = nodeList.item(c);

					if (node.getNodeType() == Node.ELEMENT_NODE) {

						Element element = (Element) node;

						Question question = new Question(element
								.getElementsByTagName("Frage").item(0)
								.getTextContent());

						if (element.getElementsByTagName("Zeit").item(0)
								.getTextContent() != "") {
							question.setTimeout(Integer.parseInt(element
									.getElementsByTagName("Zeit").item(0)
									.getTextContent()));
						}

						question.addAnswer(element
								.getElementsByTagName("AntwortTrue").item(0)
								.getTextContent());
						for (int i = 0; i < element.getElementsByTagName(
								"Antwort").getLength(); i++) {
							question.addBogusAnswer(element
									.getElementsByTagName("Antwort").item(i)
									.getTextContent());
						}
						// Make sure the question is complete
						if (question.isComplete())
							// Add some randomization
							question.shuffleAnswers();
						questions.add(question);
					}
				}
			} catch (ParserConfigurationException | SAXException | IOException e) {
				// TODO Auto-generated catch block
				e.printStackTrace();
			}

			return questions;
		}
	}
}
