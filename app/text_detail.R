box::use(
    shiny[h3, moduleServer, NS, div, tagList, textOutput, renderText, reactive, req, 
          uiOutput, renderUI, a, HTML],
    httr[GET, content, add_headers], 
    tibble[tibble],
    shiny.router[get_query_param],
    dplyr[filter, pull, select, left_join, slice, mutate, if_else, case_when],
    tidyr[pivot_longer, everything]
)

#' @export
ui <- function(id) {
    ns <- NS(id)
    
    tagList(
        h3("Text"),
        uiOutput(ns("text")),
        
        h3("Manuscripts"),
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
        
        text_id <- reactive({
            text_id <- get_query_param("textId")
            as.character(text_id)
        })
        
        output$text <- renderUI({
            req(text_id())
            text <- readRDS("app/data/works.rds") |>
                filter(id == !!as.character(text_id()))
            
            copies <- readRDS("app/data/manuscript_copies.rds") |>
                mutate(manuscript = if_else(sigla == "114", 
                                            "Venice, Biblioteca Nazionale Marciana, MS Zanetti Lat. 535 (Valentinelli XIV .13)",
                                            manuscript
                )) |>
                filter(sigla == !!text$sigla) |>
                slice(1) |>
                select(text, sigla)
            
            author <- readRDS("app/data/authors.rds") |>
                filter(name == !!text$author) |>
                select(author_id = id, name)
            
            text <- left_join(text, author, by = c("author"="name")) |> 
                select(id, sigla, author, title, everything()) |>
                # left_join(text, copies, by = "sigla") |>
                mutate(
                    author = if_else(
                        !is.na(author),
                        as.character(a(author, href = paste0("#!/author_detail?authorId=", author_id))),
                        author
                    ),
                    translation = 
                        if_else(!is.na(translation_from),
                                paste0(translation_from, " → ", 
                                         translation_to),
                                translation_from),
                    edition = if_else(
                        !is.na(edition),
                        as.character(a(edition, href = edition_link, target = "_blank")),
                        edition
                    ),
                    permalink = paste0("http://optiq.flu.cas.cz/#!/text_detail?textId=", id)
                ) |>
                select(-c(author_id, translation_from, translation_to, id, 
                          edition_link)) |>
                select(where(~!is.na(.x)))
            
            text_long <- text |> 
                pivot_longer(
                    cols = everything(),
                    names_to = "name", 
                    values_to = "value"
                ) |> 
                mutate(
                    name = case_when(
                        name == "sigla" ~ "Siglum",
                        name == "title" ~ "Title",
                        name == "author" ~ "Author",
                        name == "translator" ~ "Translator",
                        name == "translation" ~ "Translation",
                        name == "edition" ~ "Edition",
                        name == "literature" ~ "Literature",
                        name == "notes" ~ "Notes",
                        name == "permalink" ~ "Permanlink",
                        TRUE ~ name
                    )
                )
            
            purrr::map(1:nrow(text_long), function(x) {
                div(
                    div(text_long$name[x], class = "name"),
                    div(HTML(text_long$value[x]), class = "value"), 
                    class = "row"
                )
            }) |> div(class = "table")
        })
        
        output$copies <- renderUI({
            req(text_id())
            text <- readRDS("app/data/works.rds") |>
                filter(id == !!as.character(text_id()))
            
            manuscripts <- readRDS("app/data/manuscripts.rds") |>
                select(manuscript_id = id, manuscript)
            
            copies <- readRDS("app/data/manuscript_copies.rds") |>
                filter(sigla == !!text$sigla) |>
                mutate(manuscript = if_else(sigla == "114", 
                                            "Venice, Biblioteca Nazionale Marciana, MS Zanetti Lat. 535 (Valentinelli XIV .13)",
                                            manuscript
                )) |> 
                left_join(manuscripts, by = c("manuscript"))
            
            purrr::map(1:nrow(copies), function(i) {
                div(
                    div(
                        div("Shelfmark", class = "name"), 
                        div(a(copies$manuscript[i], 
                              href=paste0("#!/manuscript_detail?manuscriptId=", 
                                          copies$manuscript_id[i])), 
                            class = "value"),
                        class = "row"
                    ),
                    div(
                        div("Foliation", class = "name"),
                        div(copies$foliation[i], class = "value"),
                        class = "row"
                    ),
                    div(
                        div("Date", class = "name"),
                        div(copies$date[i], class = "value"),
                        class = "row"
                    ),
                    div(
                        div("Incipit", class = "name"),
                        div(copies$incipit[i], class = "value"), 
                        class = "row"
                    ),
                    div(
                        div("Note", class = "name"),
                        div(if_else(is.na(copies$note[i]), "", copies$note[i]), class = "value"),
                        class = "row"
                    ),
                    class = "copy"
                )
            })
        })
        
        
    })
}