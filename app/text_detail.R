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
        h3("Text"),
        
        div(
            htmltools::tags$b("Author: "),
            textOutput(ns("author"))
        ),
        
        div(
            htmltools::tags$b("Permalink: "),
            textOutput(ns("id"))    
        )
        
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
        
        text_id <- reactive({
            text_id <- get_query_param("textId")
            as.character(text_id)
        })
        
        output$author <- renderText({
            req(text_id())
            readRDS("app/data/works.rds") |>
                filter(id == !!as.character(text_id())) |>
                pull(author) |>
                as.character()
        })
        
        output$id <- renderText({
            paste0("https://něco.cz/text_detail?textId=", text_id())
        })
        
        
    })
}