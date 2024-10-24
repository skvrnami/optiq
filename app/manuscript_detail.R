box::use(
    shiny[h3, moduleServer, NS, div, tagList, textOutput, renderText, reactive, req, 
          uiOutput, renderUI, a],
    httr[GET, content, add_headers], 
    tibble[tibble],
    shiny.router[get_query_param],
    dplyr[filter, pull, left_join, select, case_when, if_else, arrange]
)

#' @export
ui <- function(id) {
    ns <- NS(id)
    
    tagList(
        htmltools::tags$script(src = "https://unpkg.com/mirador@latest/dist/mirador.min.js"),
        
        h3("Manuscript"),
        uiOutput(ns("manuscript")),
        
        h3("Texts"),
        uiOutput(ns("copies"))
        
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
        
        output$manuscript <- renderUI({
            req(manuscript_id())
            
            manuscript <- readRDS("app/data/manuscripts.rds") |>
                filter(id == !!as.character(manuscript_id()))
            
            div(
                # div(
                #     div("ID", class = "name"), 
                #     div(manuscript$id), 
                #     class = "row"
                # ),
                div(
                    div("Shelfmark", class = "name"),
                    div(manuscript$manuscript, class = "value"),
                    class = "row"
                ),
                div(
                    div("Catalogue", class = "name"),
                    div(
                        if(!is.na(manuscript$catalogue) & !is.na(manuscript$catalogue_link)){
                            a(manuscript$catalogue, href = manuscript$catalogue_link)
                        }else if(!is.na(manuscript$catalogue)){
                            manuscript$catalogue
                        }else{
                            "-"
                        }, class = "value"),
                    class = "row"
                ),
                div(
                    div("Grid", class = "name"),
                    div(manuscript$grid, class = "value"), 
                    class = "row"
                ),
                div(
                    div("Wikidata", class = "name"),
                    div(
                        if(!is.na(manuscript$wikidata)){
                            a(manuscript$wikidata, href = paste0("https://www.wikidata.org/wiki/", manuscript$wikidata))
                        }else{
                            "-"
                        }, 
                        class = "value"
                    ), 
                    class = "row"
                ),
                div(
                    div("GND", class = "name"),
                    div(manuscript$gnd, class = "value"), 
                    class = "row"
                ),
                div(
                    div("Digital copy", class = "name"),
                    div(manuscript$digital_copy, class = "value"), 
                    class = "row"
                ),
                div(
                    div("Facsimile", class = "name"),
                    div(manuscript$facsimile, class = "value"), 
                    class = "row"
                ),
                div(
                    div("Digitized copy (Mirador)", class = "name"),
                    div(
                        if(!is.na(manuscript$iihf)){
                            a("Digitalised copy (Mirador)", href=paste0("#!/mirador?manuscriptId=", manuscript$id))
                        }else{
                            "-"
                        }, 
                        class = "value"
                    ),
                    class = "row"
                ),
                div(
                    div("Permalink", class = "name"),
                    div(paste0("https://něco.cz/manuscript_detail?manuscriptId=", manuscript$id), 
                        class = "value"),
                    class = "row"
                ), 
                class = "table"
            )
        })
        
        output$copies <- renderUI({
            req(manuscript_id())
            shelfmark <- readRDS("app/data/manuscripts.rds") |>
                filter(id == !!as.character(manuscript_id())) |>
                pull(manuscript) |>
                as.character()
            authors <- readRDS("app/data/authors.rds") |>
                select(author_id = id, name)
            works <- readRDS("app/data/works.rds") |> 
                select(text_id = id, sigla, author) |>
                left_join(authors, by = c("author"="name"))
            copies <- readRDS("app/data/manuscript_copies.rds") |>
                filter(manuscript == !!shelfmark) |>
                left_join(works, by = c("sigla"="sigla")) |>
                arrange(foliation)
            
            
            purrr::map(1:nrow(copies), function(i) {
                div(
                    div(
                        div("Title", class = "name"), 
                        div(a(copies$text[i], href=paste0("#!/text_detail?textId=", copies$text_id[i])), 
                            class = "value"),
                        class = "row"
                    ),
                    div(
                        div("Author", class = "name"), 
                        div(a(copies$author[i], href=paste0("#!/author_detail?authorId=", copies$author_id[i])), 
                            class = "value"),
                        class = "row"
                    ),
                    div(
                        div("Foliation", class = "name"),
                        div(copies$foliation[i], class = "value"),
                        class = "row"
                    ),
                    div(
                        div("Sigla", class = "name"),
                        div(copies$sigla[i], class = "value"),
                        class = "row"
                    ),
                    div(
                        div("Date", class = "name"),
                        div(copies$date[i], class = "value"),
                        class = "row"
                    ),
                    htmltools::tags$br()
                )
            })
        })
    })
}