box::use(
    shiny[h3, moduleServer, NS, div, tagList, a],
    DT[DTOutput, renderDataTable], 
    httr[GET, content, add_headers], 
    tibble[tibble],
    dplyr[select]
)

#' @export
ui <- function(id) {
    ns <- NS(id)
    
    tagList(
        h3("Authors"),
        DTOutput(ns("authors"))
    )
    
}

#' @export
server <- function(id) {
    moduleServer(id, function(input, output, session) {
        # token <- Sys.getenv("OPTIQ_TOKEN")
        # 
        # parse_authors <- function(objects) {
        #     purrr::map_df(objects, function(x) {
        #         tibble(
        #             name = x$object_definitions$`35365`$object_definition_value, 
        #             alternative_name = x$object_definitions$`35366`$object_definition_value, 
        #             author_wiki = x$object_definitions$`35373`$object_definition_value, 
        #             origin = x$object_definitions$`35410`$object_definition_value
        #         )
        #     })
        # }
        # 
        # get_authors <- function(author_id, token){
        #     url <- glue::glue("https://api.nodegoat.hiu.cas.cz/project/2968/data/type/{author_id}/object/data")
        #     response <- GET(url, add_headers(Authorization = paste("Bearer", token)))
        #     con <- content(response)
        #     parse_authors(con$data$objects)
        # }
        # 
        # authors <- get_authors(author_id = 11223, 
        #                        token = token)
        authors <- readRDS("app/data/authors.rds")
        
        output$authors <- renderDataTable({
            a_table <- authors
            a_table$name <- purrr::map2_chr(
                a_table$name, a_table$id, function(x, y) {
                    as.character(a(x, href=paste0("#!/author_detail?authorId=", y)))
                }
            )
            
            return(a_table |> select(-c(id)))
        }, escape = FALSE, rownames = FALSE)
    })
}