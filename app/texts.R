box::use(
  shiny[h3, moduleServer, NS, div, tagList, a, img],
  DT[DTOutput, renderDataTable, JS],
  httr[GET, content, add_headers],
  tibble[tibble],
  purrr[map2_chr],
  dplyr[
    select,
    filter,
    arrange,
    left_join,
    mutate,
    if_else,
    group_by,
    slice,
    ungroup
  ],
  tidyr[pivot_longer, pivot_wider],
  stringr[str_extract]
)

#' @export
ui <- function(id) {
  ns <- NS(id)

  tagList(
    h3("Texts"),
    DTOutput(ns("texts"))
  )
}

#' @export
server <- function(id) {
  moduleServer(id, function(input, output, session) {
    authors <- readRDS("app/data/authors.rds") |>
      select(author_id = id, author = name)

    texts <- readRDS("app/data/works_reshaped.rds") |>
      group_by(id) |>
      slice(1) |>
      ungroup() |>
      arrange(title) |>
      left_join(authors, by = "author")

    output$texts <- renderDataTable(
      {
        t_table <- texts

        return(
          t_table |>
            select(
              id,
              author_id,
              Siglum = sigla,
              Author = author,
              Title = title,
              Edition = edition_link
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
          list(visible = FALSE, targets = 0),
          list(visible = FALSE, targets = 1),
          list(
            targets = 3,
            render = JS(
              "function(data, type, row, meta) {
                    if (type === 'display') {
                    data = '<a href=\"#!/author_detail?authorId=' + 
                    row[1] + '\" >' + row[3] + '</a>';
                    }
                    return data;
                    }"
            )
          ),
          list(
            targets = 4,
            render = JS(
              "function(data, type, row, meta) {
                    if (type === 'display') {
                    data = '<a href=\"#!/text_detail?textId=' + 
                    row[0] + '\" >' + row[4] + '</a>';
                    }
                    return data;
                    }"
            )
          ),
          list(
            targets = 5,
            render = JS(
              "function(data, type, row, meta) {
                    if (type === 'display') {
                    if (!!row[5]) {
                    data = '<a href=\"' + 
                    row[5] + '\" ><img width=\"20\" height=\"20\" src=\"https://img.icons8.com/ios/50/link--v1.png\"/></a>';
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
