box::use(
  shiny[
    h1,
    h3,
    moduleServer,
    NS,
    div,
    tagList,
    textOutput,
    renderText,
    reactive,
    req,
    uiOutput,
    renderUI,
    a
  ],
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
          div("Name", class = "name"),
          div(author$name, class = "value"),
          class = "row"
        ),
        div(
          div("Lifetime", class = "name"),
          div(author$origin, class = "value"),
          class = "row"
        ),
        div(
          div("Wikidata", class = "name"),
          div(
            a(
              author$author_wiki,
              href = paste0(
                "https://www.wikidata.org/wiki/",
                author$author_wiki
              ),
              target = "_blank"
            ),
            class = "value"
          ),
          class = "row"
        ),
        div(
          div("Permalink", class = "name"),
          div(
            paste0(
              "http://optiq.flu.cas.cz/#!/author_detail?authorId=",
              author$id
            ),
            class = "value"
          ),
          class = "row"
        ),
        class = "table"
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
              a(
                works$title[i],
                href = paste0("#!/text_detail?textId=", works$id[i])
              )
            )
          ),
          htmltools::tags$br()
        )
      })
    })
  })
}
