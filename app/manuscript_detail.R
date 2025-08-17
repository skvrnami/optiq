box::use(
    shiny[h3, moduleServer, NS, div, tagList, textOutput, renderText, reactive, req, 
          uiOutput, renderUI, a, HTML, img],
    httr[GET, content, add_headers], 
    tibble[tibble],
    shiny.router[get_query_param],
    dplyr[filter, pull, left_join, select, case_when, if_else, arrange, where, 
          mutate, reframe, across, group_by], 
    tidyr[pivot_longer, everything], 
    stats[na.omit]
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
            
            copies <- readRDS("app/data/manuscript_copies.rds") |>
                select(manuscript, date) |>
                unique()
            
            manuscript_joined <- readRDS("app/data/manuscripts.rds") |>
                filter(id == !!as.character(manuscript_id())) |>
                left_join(copies, by = "manuscript")
            
            if(nrow(manuscript_joined) == 1){
                manuscript <- manuscript_joined |> 
                mutate(
                    catalogue = if_else(
                        !is.na(catalogue_link) & !is.na(catalogue),
                        as.character(a(catalogue, href = catalogue_link, 
                                       target = "_blank")),
                        catalogue
                    ),
                    facsimile = if_else(
                        !is.na(facsimile),
                        as.character(a("Link ", img(width="20", height="20", src="https://img.icons8.com/ios/50/link--v1.png"), href = facsimile, 
                                       target = "_blank")),
                        facsimile
                    ),
                    digital_copy = if_else(
                        !is.na(digital_copy),
                        as.character(a("Link ", img(width="20", height="20", src="https://img.icons8.com/ios/50/link--v1.png"), href = digital_copy, 
                                       target = "_blank")),
                        digital_copy
                    ),
                    wikidata = if_else(
                        !is.na(wikidata), 
                        as.character(a(wikidata, href = paste0("https://www.wikidata.org/wiki/", wikidata), 
                                       target = "_blank")),
                        wikidata
                    ),
                    iihf = if_else(
                        !is.na(iihf),
                        as.character(a("Digitalised copy (Mirador)", 
                                       img(width="20", height="20", src="static/iiif.png"),
                                       href = paste0("#!/mirador?manuscriptId=", id),
                                       target = "_blank")),
                        iihf
                    ),
                    permalink = paste0("http://optiq.flu.cas.cz/#!/manuscript_detail?manuscriptId=", id)
                ) |>
                select(-c(catalogue_link, id)) |>
                select(where(~!is.na(.x)))
            
            }else{
                manuscript <- manuscript_joined |> 
                    group_by(id, manuscript) |> 
                    reframe(across(everything(), ~paste0(na.omit(unique(.x)), collapse = ", "))) |> 
                    mutate(
                    catalogue = if_else(
                        !is.na(catalogue_link) & !is.na(catalogue),
                        as.character(a(catalogue, href = catalogue_link, 
                                       target = "_blank")),
                        catalogue
                    ),
                    facsimile = if_else(
                        !is.na(facsimile),
                        as.character(a("Link ", img(width="20", height="20", src="https://img.icons8.com/ios/50/link--v1.png"), href = facsimile, 
                                       target = "_blank")),
                        facsimile
                    ),
                    digital_copy = if_else(
                        !is.na(digital_copy),
                        as.character(a("Link ", img(width="20", height="20", src="https://img.icons8.com/ios/50/link--v1.png"), href = digital_copy, 
                                       target = "_blank")),
                        digital_copy
                    ),
                    wikidata = if_else(
                        !is.na(wikidata), 
                        as.character(a(wikidata, href = paste0("https://www.wikidata.org/wiki/", wikidata), 
                                       target = "_blank")),
                        wikidata
                    ),
                    iihf = if_else(
                        !is.na(iihf),
                        as.character(a("Digitalised copy (Mirador)", href = paste0("#!/mirador?manuscriptId=", id),
                                       target = "_blank")),
                        iihf
                    ),
                    permalink = paste0("http://optiq.flu.cas.cz/#!/manuscript_detail?manuscriptId=", id)
                ) |>
                select(-c(catalogue_link, id)) |>
                select(where(~!is.na(.x)))


            }

            manuscript_long <- manuscript |> 
                select(manuscript, date, everything()) |> 
                pivot_longer(
                cols = everything(),
                names_to = "name", 
                values_to = "value"
            ) |> 
                mutate(
                    name = case_when(
                        name == "manuscript" ~ "Shelfmark",
                        name == "date" ~ "Origin",
                        name == "catalogue" ~ "Catalogue",
                        name == "facsimile" ~ "Facsimile",
                        name == "wikidata" ~ "Wikidata",
                        name == "grid" ~ "Grid",
                        name == "gnd" ~ "GND",
                        name == "digital_copy" ~ "Digital copy",
                        name == "iihf" ~ "Digitized copy (Mirador)",
                        name == "permalink" ~ "Permalink",
                        TRUE ~ name
                    )
                )
            
            purrr::map(1:nrow(manuscript_long), function(x) {
                div(
                    div(manuscript_long$name[x], class = "name"),
                    div(HTML(manuscript_long$value[x]), class = "value"), 
                    class = "row"
                )
            }) |> div(class = "table")

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
                mutate(manuscript = if_else(sigla == "114", 
                                            "Venice, Biblioteca Nazionale Marciana, MS Zanetti Lat. 535 (Valentinelli XIV .13)",
                                            manuscript
                )) |>
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
                    # div(
                    #     div("Sigla", class = "name"),
                    #     div(copies$sigla[i], class = "value"),
                    #     class = "row"
                    # ),
                    # div(
                    #     div("Date", class = "name"),
                    #     div(copies$date[i], class = "value"),
                    #     class = "row"
                    # ),
                    class = "copy"
                )
            })
            
        })
    })
}