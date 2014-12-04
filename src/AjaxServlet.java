
import java.io.IOException;
import java.io.PrintWriter;
import java.util.Map;
import java.util.Map.Entry;

import javax.servlet.ServletException;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import de.fhwgt.quiz.application.Catalog;
import de.fhwgt.quiz.application.Quiz;
import de.fhwgt.quiz.loader.FilesystemLoader;
import de.fhwgt.quiz.loader.LoaderException;



/**
 * Servlet implementation class AjaxServlet
 */
@WebServlet("/AjaxServlet")
public class AjaxServlet extends HttpServlet {
	private static final long serialVersionUID = 1L;
	
    /**
     * Default constructor. 
     */
    public AjaxServlet() {
        // TODO Auto-generated constructor stub
    }

	/**
	 * @see HttpServlet#doGet(HttpServletRequest request, HttpServletResponse response)
	 */
	protected void doGet(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
		// TODO Auto-generated method stub
		Quiz q = Quiz.getInstance();
		FilesystemLoader cLoader = new FilesystemLoader("Catalogs");
		q.initCatalogLoader(cLoader);
		Map<String, Catalog> mp = null;
		try {
			mp = q.getCatalogList();
		} catch (LoaderException e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
		}
		
		String katalogs = "<main>";
		
		for(Entry<String, Catalog> e : mp.entrySet()){
			katalogs += "<katalogName>"+e.getKey().substring(0, e.getKey().length()-4)+"</katalogName>";
		}
		katalogs += "</main>";
		response.setContentType("text/xml");	
	    PrintWriter writer=response.getWriter();
	    
	    writer.print(katalogs);
	    
	}

	/**
	 * @see HttpServlet#doPost(HttpServletRequest request, HttpServletResponse response)
	 */
	protected void doPost(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
		// TODO Auto-generated method stub
	}

}
