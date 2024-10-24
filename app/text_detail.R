box::use(
    shiny[h3, moduleServer, NS, div, tagList, textOutput, renderText, reactive, req, 
          uiOutput, renderUI, a],
    httr[GET, content, add_headers], 
    tibble[tibble],
    shiny.router[get_query_param],
    dplyr[filter, pull, select, left_join, slice]
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
                filter(sigla == !!text$sigla) |>
                slice(1) |>
                select(text, sigla)
            
            text <- left_join(text, copies, by = "sigla")
            
            author <- readRDS("app/data/authors.rds") |>
                filter(name == text$author)
            
            div(
                # div(
                #     div("ID", class = "name"), 
                #     div(text$id), 
                #     class = "row"
                # ),
                div(
                    div("Sigla", class = "name"), 
                    div(text$sigla, class = "value"), 
                    class = "row"
                ),
                div(
                    div("Title", class = "name"),
                    div(text$title, class = "value"),
                    class = "row"
                ),
                div(
                    div("Author", class = "name"),
                    if(text$author == "Anonymous"){
                        div(text$author, class = "value")    
                    }else{
                        div(a(text$author, href=paste0("#!/author_detail?authorId=", author$id)), 
                            class = "value")
                    },
                    class = "row"
                ), 
                div(
                    div("Translator", class = "name"), 
                    div(text$translator, class = "value"), 
                    class = "row"
                ),
                div(
                    div("Translation", class = "name"), 
                    if(!is.na(text$translation_from)){
                        div(paste0(text$translation_from,
                                   " → ", 
                                   text$translation_to), 
                            class = "value")
                    }else{
                        div("-", class = "value")
                    }, 
                    class = "row"
                ),
                div(
                    div("Edition", class = "name"), 
                    if(!is.na(text$edition)){
                        div(a(text$edition, href = text$edition_link, 
                              target = "_blank"), 
                            class = "value")
                    }else{
                        div("-", class = "value")
                    }, 
                    class = "row"
                ),
                div(
                    div("Literature", class = "name"),
                    div(text$literature, class = "value"),
                    class = "row"
                ),
                div(
                    div("Note", class = "name"), 
                    if(!is.na(text$notes)){
                        div(text$notes, class = "value")    
                    }else{
                        div("-", class = "value")
                    }, 
                    class = "row"
                ),
                div(
                    div("Permalink", class = "name"),
                    div(paste0("https://něco.cz/text_detail?textId=", text$id), 
                        class = "value"),
                    class = "row"
                ), 
                class = "table"
            )
        })
        
        output$copies <- renderUI({
            req(text_id())
            text <- readRDS("app/data/works.rds") |>
                filter(id == !!as.character(text_id()))
            
            manuscripts <- readRDS("app/data/manuscripts.rds") |>
                select(manuscript_id = id, manuscript)
            
            copies <- readRDS("app/data/manuscript_copies.rds") |>
                filter(sigla == !!text$sigla) |>
                left_join(manuscripts, by = c("manuscript"))
            
            
            purrr::map(1:nrow(copies), function(i) {
                div(
                    div(
                        div("Manuscript", class = "name"), 
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
                        div("Incipit", class = "name"),
                        div(copies$incipit[i], class = "value"), 
                        class = "row"
                    ),
                    div(
                        div("Date", class = "name"),
                        div(copies$date[i], class = "value"),
                        class = "row"
                    ),
                    htmltools::tags$br(), 
                    class = "table"
                )
            })
        })
        
        
    })
}