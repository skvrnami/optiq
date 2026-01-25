box::use(
  shiny[h3, moduleServer, NS, div, tagList, a],
  DT[DTOutput, renderDataTable, JS],
  httr[GET, content, add_headers],
  tibble[tibble],
  dplyr[select, rename, arrange]
)

#' @export
ui <- function(id) {
  ns <- NS(id)

  tagList(
    h3("Authors"),
    DTOutput(ns("authors"))
  )
}

#' @export
server <- function(id) {
  moduleServer(id, function(input, output, session) {
    authors <- readRDS("app/data/authors.rds")

    output$authors <- renderDataTable(
      {
        a_table <- authors |>
          arrange(name)

        return(
          a_table |>
            select(
              id,
              Name = name,
              `Alternative name` = alternative_name,
              `Lifetime` = origin,
              `Wiki ID` = author_wiki
            )
        )
      },
      escape = FALSE,
      rownames = FALSE,
      options = list(
        # dom = "<\"datatables-scroll\"t>",
        ordering = TRUE,
        pageLength = 50,
        columnDefs = list(
          list(
            targets = 1,
            render = JS(
              "function(data, type, row, meta) {
                    if (type === 'display') {
                    data = '<a href=\"#!/author_detail?authorId=' + 
                    row[0] + '\" >' + row[1] + '</a>';
                    }
                    return data;
                    }"
            )
          ),
          list(visible = FALSE, targets = 0),
          list(
            targets = 4,
            render = JS(
              "function(data, type, row, meta) {
                    if (type === 'display') {
                    if (!!row[4]) {
                    data = '<a href=\"https://www.wikidata.org/wiki/' + 
                    row[4] + '\" >' + row[4] + '</a>';
                    }
                    }
                    return data;
                    }"
            )
          )
        )
      )
    )
  })
}
