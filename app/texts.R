box::use(
    shiny[h3, moduleServer, NS, div, tagList, a, img],
    DT[DTOutput, renderDataTable, JS], 
    httr[GET, content, add_headers], 
    tibble[tibble], 
    purrr[map2_chr],
    dplyr[select, arrange, left_join, mutate, if_else]
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
        authors <- readRDS("app/data/authors.rds") |> 
            select(author_id = id, author = name)
        
        texts <- readRDS("app/data/works.rds") |> 
            arrange(title) |>
            left_join(authors, by = "author")
        
        output$texts <- renderDataTable({
            t_table <- texts
            
            return(t_table |> select(id, author_id, Siglum = sigla, Author = author, Title = title, Edition = edition_link))
        }, escape = FALSE, rownames = FALSE, 
        options = list(
            # dom = "<\"datatables-scroll\"t>",
            ordering = TRUE,
            columnDefs = list(
                list(visible = FALSE, targets = 0),
                list(visible = FALSE, targets = 1),
                list(targets = 3, render = JS(
                    "function(data, type, row, meta) {
                    if (type === 'display') {
                    data = '<a href=\"#!/author_detail?authorId=' + 
                    row[1] + '\" >' + row[3] + '</a>';
                    }
                    return data;
                    }"
                )),
                list(targets = 4, render = JS(
                    "function(data, type, row, meta) {
                    if (type === 'display') {
                    data = '<a href=\"#!/text_detail?textId=' + 
                    row[0] + '\" >' + row[4] + '</a>';
                    }
                    return data;
                    }"
                )), 
                list(targets = 5, render = JS(
                    "function(data, type, row, meta) {
                    if (type === 'display') {
                    if (!!row[5]) {
                    data = '<a href=\"' + 
                    row[5] + '\" ><img width=\"20\" height=\"20\" src=\"https://img.icons8.com/ios/50/link--v1.png\"/></a>';
                    }
                    }
                    return data;
                    }"
                ))
                
                
            )
        )
        
        )
    })
}