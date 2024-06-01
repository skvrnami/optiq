box::use(
    shiny[actionButton, column, div, fluidRow, h2, moduleServer, NS, observeEvent, p],
    shiny.router[change_page],
)

#' @export
ui <- function(id) {
    ns <- NS(id)
    fluidRow(
        column(
            width = 6,
            div(
                class = "jumbotron",
                h2("Optiq"),
                p("ahoj")
            )
        )
    )
}

#' @export
server <- function(id) {
    moduleServer(id, function(input, output, session) {
        observeEvent(input$go_to_authors, {
            change_page("authors")
        })
    })
}