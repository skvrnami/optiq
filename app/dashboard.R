box::use(
    shiny[h3, moduleServer, NS, div, tagList, tags],
    htmltools[HTML]
)

#' @export
ui <- function(id) {
    ns <- NS(id)
    
    tagList(
        h3("Dashboard"),
        div(
            tags$iframe(
                src = "dist/index.html",
                style = "width: 100%; height: 800px; border: none;",
                sandbox = "allow-same-origin allow-scripts allow-popups allow-forms"
            ),
            class = "dashboard-container"
        )
    )
}

#' @export
server <- function(id) {
    moduleServer(id, function(input, output, session) {
        # No server-side logic needed for static iframe
    })
}
