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
            htmltools::tags$b("Manuscript: "),
            textOutput(ns("manuscript")),    
        ),
        
        div(
            htmltools::tags$b("Catalogue: "),
            uiOutput(ns("catalogue_link"))
        ),
        
        div(
            uiOutput(ns("iiif"))
        ),
        
        textOutput(ns("id"))
    )
}

#' @export
server <- function(id) {
    moduleServer(id, function(input, output, session) {
        # token <- Sys.getenv("OPTIQ_TOKEN")
        # 
        # parse_manuscripts <- function(objects){
        #     purrr::map_df(objects, function(x) {
        #         tibble(
        #             id = x$object$nodegoat_id,
        #             manuscript = x$object_definitions$`35374`$object_definition_value,
        #             catalogue = x$object_definitions$`35375`$object_definition_value,
        #             catalogue_link = x$object_definitions$`35376`$object_definition_value,
        #             digital_copy = x$object_definitions$`35377`$object_definition_value,
        #             facsimile = x$object_definitions$`35378`$object_definition_value,
        #             iihf = x$object_definitions$`35379`$object_definition_value,
        #             grid = x$object_definitions$`35381`$object_definition_value,
        #             wikidata = x$object_definitions$`35382`$object_definition_value,
        #             gnd = x$object_definitions$`35383`$object_definition_value
        #         )
        #     })
        # }
        # 
        # get_manuscript <- function(token, manuscript_id){
        #     if(length(manuscript_id)){
        #         manuscript_id <- manuscript_id
        #         url <- glue::glue("https://api.nodegoat.hiu.cas.cz/project/2968/data/type/11225/object/data?object_id={manuscript_id}")
        #         response <- GET(url, add_headers(Authorization = paste("Bearer", token)))
        #         con <- content(response)
        #         
        #         parse_manuscripts(con$data$objects)    
        #     }else{
        #         "Loading"
        #     }
        # }

        manuscript_id <- reactive({
            manuscript_id <- get_query_param("manuscriptId")
            as.character(manuscript_id)
        })
        
        output$manuscript <- renderText({
            req(manuscript_id())
            readRDS("app/data/manuscripts.rds") |>
                filter(id == !!as.character(manuscript_id())) |>
                pull(manuscript) |>
                as.character()
        })
        
        output$catalogue_link <- renderUI({
            req(manuscript_id())
            link <- readRDS("app/data/manuscripts.rds") |>
                filter(id == !!as.character(manuscript_id())) |>
                pull(catalogue_link) 
            if(!is.na(link)){
                a("Catalogue link", href=link)
            }
        })
        
        output$iiif <- renderUI({
            req(manuscript_id())
            iiif <- readRDS("app/data/manuscripts.rds") |>
                filter(id == !!as.character(manuscript_id())) |>
                pull(iihf) 
            if(!is.na(iiif)){
                htmltools::HTML(paste0('
                <div id="my-mirador"></div>
                <script type="text/javascript">
                var mirador = Mirador.viewer({
                    id: "my-mirador",
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

        output$id <- renderText({
            manuscript_id()
        })
        
        
    })
}