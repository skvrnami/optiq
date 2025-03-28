box::use(
    shiny[h3, moduleServer, NS, div, tagList, a],
    DT[DTOutput, renderDataTable, JS], 
    httr[GET, content, add_headers], 
    tibble[tibble], 
    purrr[map2_chr],
    dplyr[select, left_join]
)

#' @export
ui <- function(id) {
    ns <- NS(id)
    
    tagList(
        h3("Manuscripts"),
        DTOutput(ns("manuscripts"))
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
        copies <- readRDS("app/data/manuscript_copies.rds") |>
            select(manuscript, sigla, text, date) |>
            unique()
        authors <- readRDS("app/data/authors.rds") |>
            select(author_id = id, name)
        works <- readRDS("app/data/works.rds") |>
            select(text_id = id, sigla, author) |>
            left_join(authors, by = c("author"="name"))
        manuscripts <- readRDS("app/data/manuscripts.rds") |>
            left_join(copies, by = "manuscript") |>
            left_join(works, by = "sigla")
        
        output$manuscripts <- renderDataTable({
            m_table <- manuscripts
            # m_table$manuscript <- purrr::map2_chr(
            #     m_table$manuscript, m_table$id, function(x, y) {
            #         as.character(a(x, href=paste0("#!/manuscript_detail?manuscriptId=", y)))
            #     }
            # )
            # m_table$catalogue_link <- purrr::map_chr(m_table$catalogue_link, function(x) {
            #     if_else(!is.na(x), as.character(a("Link", href=x)),
            #             "")
            # })
            
            return(m_table |> select(id, Shelfmark = manuscript, Author = author, 
                                     Siglum = sigla, Title = text, 
                                     Origin = date, Facsimile = facsimile, author_id))
        }, escape = FALSE, rownames = FALSE, 
        # style = 'bootstrap',
        # filter = list(position = 'top', clear = FALSE),
        options = list(
            # dom = "<\"datatables-scroll\"t>",
            ordering = TRUE,
            columnDefs = list(
                list(targets = 1, render = JS(
                    "function(data, type, row, meta) {
                    if (type === 'display') {
                    data = '<a href=\"#!/manuscript_detail?manuscriptId=' + 
                    row[0] + '\" >' + row[1] + '</a>';
                    }
                    return data;
                    }"
                    )),
                list(targets = 2, render = JS(
                    "function(data, type, row, meta) {
                    if (type === 'display') {
                    data = '<a href=\"#!/author_detail?authorId=' + 
                    row[7] + '\" >' + row[2] + '</a>';
                    }
                    return data;
                    }"
                )),
                list(targets = 6, render = JS(
                    "function(data, type, row, meta) {
                    if (type === 'display') {
                    if (!!row[6]) {
                    data = '<a href=\"' + 
                    row[6] + '\" ><img width=\"20\" height=\"20\" src=\"https://img.icons8.com/ios/50/link--v1.png\"/></a>';
                    }
                    }
                    return data;
                    }"
                )),
                list(visible = FALSE, targets = 0), 
                list(visible = FALSE, targets = 7)
            )
        )
        
        )
    })
}