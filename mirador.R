box::use(
    shiny[h3, moduleServer, NS, div, tagList, textOutput, renderText, reactive, req, 
          uiOutput, renderUI, a],
    httr[GET, content, add_headers], 
    tibble[tibble],
    shiny.router[get_query_param],
    dplyr[filter, pull]
)

#' @export
ui <- function(id) {
    ns <- NS(id)
    
    tagList(
        htmltools::tags$script(src = "https://unpkg.com/mirador@latest/dist/mirador.min.js"),
        
        h3("Manuscript"),
        div(
            uiOutput(ns("iiif"))
        )
    )
}

#' @export
server <- function(id) {
    moduleServer(id, function(input, output, session) {
        
        manuscript_id <- reactive({
            manuscript_id <- get_query_param("manuscriptId")
            as.character(manuscript_id)
        })
        
        output$iiif <- renderUI({
            req(manuscript_id())
            iiif <- readRDS("app/data/manuscripts.rds") |>
                filter(id == !!as.character(manuscript_id())) |>
                pull(iihf) 
            if(!is.na(iiif)){
                htmltools::HTML(paste0('
                <div id="mirador"></div>
                <script type="text/javascript">
                var mirador = Mirador.viewer({
                    id: "mirador",
                    manifests: {"',
                iiif, 
                '": { },
                },
                windows: [
                    {
                        loadedManifest: "',
                iiif, '",
                canvasIndex: 2,
                thumbnailNavigationPosition: "far-bottom",
                },
                ],
                });
                </script>'))
            }
        })
        
    })
}