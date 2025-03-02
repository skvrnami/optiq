box::use(
    shiny[actionButton, column, div, fluidRow, h2, moduleServer, NS, observeEvent, p],
    shiny.router[change_page],
    htmltools[HTML, br]
)

#' @export
ui <- function(id) {
    ns <- NS(id)
    fluidRow(
        div(
            h2("Home page"),
            p("The OptiQ project aims to create a database application for a corpus of medieval and early modern texts on the history of optics, which are preserved mainly in manuscripts."),
            p(HTML("The project is based on David C. Lindberg's <i>A Catalogue of Medieval and Renaissance Optical Manuscripts</i> (1975). The database, which also includes Bohemian and Central European manuscripts and literature, provides access to other online relevant materials (digital manuscript catalogues, editions, manuscript facsimiles, author databases, etc.) according to the latest digital standards (e.g. IIIF).")),
            p(HTML("In synergy with Dr Lukáš Lička's research, supported by the Czech Grant Agency within the project <i>Peckham's Age: The Role of Jan Peckham's Perspectiva communis in the Dissemination and Development of Optical Knowledge, 1279-1542</i>, the database will be expanded in the last phase to include many newly discovered texts and manuscripts. This will constitute a scientific infrastructure corresponding to the current knowledge and research needs.")),
            p("Therefore, the application does not claim to be entirely current in terms of individual texts and manuscripts."),
            p("OptiQ includes two main tools:", 
              HTML("<ol>
                    <li>The Manuscripts item consists of a catalogue of the manuscript corpus with extant texts on optics</li>
                    <li>The Texts item consists of a catalogue of the corpus of texts on optics preserved in the manuscripts of our database</li>
                   </ol>")
            ),
            p("To support the maintenance and further development of the database, we ask all users to acknowledge the use of OptiQ in their research outcomes and to use the permalinks available on the individual pages with detailed information on texts and manuscripts."),
            p("OptiQ has been developed at the Institute of Philosophy of the Czech Academy of Sciences within the Lindat/CLARIAH-CZ project (LM2023062) and is fully supported by the Ministry of Education, Youth, and Sports of the Czech Republic under the programme LM of \"Large Infrastructures\". The team comprises Lukáš Lička, Jan Škvrňák and Ota Pavlíček."),
            
            p("We welcome any feedback, suggestions for cooperation or enrichment of the application at:",
              br(), "Ota Pavlíček", br(),
              "Institute of Philosophy", br(),
              "Czech Academy of Sciences", br(),
              "Jilská 1", br(),
              "110 00 Prague", br(),
              "Czech Republic", br(),
              "ota.pavlicek[at]flu.cas.cz", br()
              )
        )
    )
        
    
}

#' @export
server <- function(id) {
    moduleServer(id, function(input, output, session) {
        observeEvent(input$go_to_authors, {
            change_page("authors")
        })
    })
}