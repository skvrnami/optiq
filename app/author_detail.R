box::use(
    shiny[h1, h3, moduleServer, NS, div, tagList, textOutput, renderText, reactive, req, 
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
        h1("Author"),
        uiOutput(ns("author")),
        h3("Authored works:"),
        uiOutput(ns("works"))
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
        
        author_id <- reactive({
            author_id <- get_query_param("authorId")
            as.character(author_id)
        })
        
        output$author <- renderUI({
            req(author_id())
            author <- readRDS("app/data/authors.rds") |>
                filter(id == !!as.character(author_id()))
            
            div(
                div(
                    div("ID", class = "name"), 
                    div(author$id), 
                    class = "row"
                ),
                div(
                    div("Name", class = "name"),
                    div(author$name),
                    class = "row"
                ),
                div(
                    div("Wikidata", class = "name"),
                    div(a(author$author_wiki, href = paste0("https://www.wikidata.org/wiki/", author$author_wiki))),
                    class = "row"
                ),
                div(
                    div("Origin", class = "name"),
                    div(author$origin), 
                    class = "row"
                ),
                div(
                    div("Permalink", class = "name"),
                    paste0("https://něco.cz/author_detail?authorId=", author$id),
                    class = "row"
                )
            )
        })
        
        output$works <- renderUI({
            req(author_id())
            author_name <- readRDS("app/data/authors.rds") |>
                filter(id == !!as.character(author_id())) |>
                pull(name)
            works <- readRDS("app/data/works.rds") |>
                filter(author == author_name)
            
            purrr::map(1:nrow(works), function(i) {
                div(
                    htmltools::tags$div(
                        htmltools::tags$div(
                            # htmltools::tags$td(
                            #     htmltools::tags$b("Title")
                            # ),
                            # htmltools::tags$td(
                                a(works$title[i], href=paste0("#!/text_detail?textId=", works$id[i]))
                            # )
                        )
                    ),
                    htmltools::tags$br()
                )   
            })
        })
        
    })
}