box::use(
  shiny[bootstrapPage, div, moduleServer, NS, renderUI, tags, uiOutput, a],
  shiny.router[router_ui, router_server, route, route_link]
)

box::use(
  app/intro,
  app/authors,
  app/manuscripts,
  app/manuscript_detail
)

#' @export
ui <- function(id) {
  ns <- NS(id)
  
  bootstrapPage(
    tags$nav(
      class = "navbar",
      tags$ul(
        class = "nav navbar-nav",
        tags$li(
          a("Home", href = route_link("/"))
        ),
        tags$li(
          a("Authors", href = route_link("authors"))
        ),
        tags$li(
          a("Manuscripts", href = route_link("manuscripts"))
        ),
      )
    ),
    router_ui(
      route("/", intro$ui(ns("intro"))),
      route("authors", authors$ui(ns("authors"))),
      route("manuscripts", manuscripts$ui(ns("manuscripts"))),
      route("manuscript_detail", manuscript_detail$ui(ns("manuscript_detail")))
    )
  )
}

#' @export
server <- function(id) {
  moduleServer(id, function(input, output, session) {
    router_server("/")
    
    intro$server("intro")
    authors$server("authors")
    manuscripts$server("manuscripts")
    manuscript_detail$server("manuscript_detail")
  })
}
