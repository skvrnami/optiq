box::use(
    shiny[h3, moduleServer, NS, div, tagList, a],
    DT[DTOutput, renderDataTable], 
    httr[GET, content, add_headers], 
    tibble[tibble], 
    purrr[map2_chr],
    dplyr[select, arrange]
)

#' @export
ui <- function(id) {
    ns <- NS(id)
    
    tagList(
        h3("Texts"),
        DTOutput(ns("texts"))
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
        # manuscript_id <- 11225
        # 
        # get_manuscripts <- function(manuscript_id, token){
        #     url <- glue::glue("https://api.nodegoat.hiu.cas.cz/project/2968/data/type/{manuscript_id}/object/data")
        #     response <- GET(url, add_headers(Authorization = paste("Bearer", token)))
        #     con <- content(response)
        #     
        #     parse_manuscripts(con$data$objects)
        # }
        # 
        # manuscripts <- get_manuscripts(manuscript_id, token)
        texts <- readRDS("app/data/works.rds") |> 
            arrange(title)
        
        output$texts <- renderDataTable({
            t_table <- texts
            t_table$title <- purrr::map2_chr(
                t_table$title, t_table$id, function(x, y) {
                    as.character(a(x, href=paste0("/#!/text_detail?textId=", y)))
                }
            )
            return(t_table |> select(-c(id, translator_wiki, translation_from, translation_to, 
                                        edition, edition_link, notes, literature)))
        }, escape = FALSE, rownames = FALSE)
    })
}