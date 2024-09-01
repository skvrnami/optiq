box::use(
    shiny[actionButton, column, div, fluidRow, h2, moduleServer, NS, observeEvent, p],
    shiny.router[change_page],
)

#' @export
ui <- function(id) {
    ns <- NS(id)
    fluidRow(
        div(
            h2("Home page"),
            p("Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Cum sociis natoque penatibus et magnis. Leo vel orci porta non. Rutrum quisque non tellus orci ac auctor augue. Nunc faucibus a pellentesque sit amet porttitor. Tristique senectus et netus et malesuada. Volutpat est velit egestas dui. Netus et malesuada fames ac turpis egestas sed. Volutpat est velit egestas dui id ornare arcu odio. Mattis molestie a iaculis at erat pellentesque. Aliquam id diam maecenas ultricies mi. Fringilla est ullamcorper eget nulla facilisi etiam. Id leo in vitae turpis massa sed elementum tempus egestas. Scelerisque purus semper eget duis at tellus."),
            p("Quis hendrerit dolor magna eget est. Orci dapibus ultrices in iaculis nunc sed augue. Varius quam quisque id diam vel quam. Egestas congue quisque egestas diam in. Dis parturient montes nascetur ridiculus mus mauris vitae. Tellus integer feugiat scelerisque varius morbi enim nunc faucibus. Dolor sit amet consectetur adipiscing elit ut aliquam. Amet luctus venenatis lectus magna. In dictum non consectetur a. Dolor sit amet consectetur adipiscing elit pellentesque habitant. Eget lorem dolor sed viverra ipsum nunc aliquet bibendum enim. Semper risus in hendrerit gravida rutrum quisque non tellus. Imperdiet proin fermentum leo vel orci porta non pulvinar. Lorem ipsum dolor sit amet consectetur adipiscing elit ut aliquam. Praesent tristique magna sit amet purus gravida. Ullamcorper sit amet risus nullam eget felis eget nunc. Diam in arcu cursus euismod quis viverra."),
            p("Morbi tristique senectus et netus et malesuada fames ac. Arcu dictum varius duis at consectetur lorem donec massa. Velit ut tortor pretium viverra. Fringilla ut morbi tincidunt augue interdum. Ipsum consequat nisl vel pretium lectus quam. In iaculis nunc sed augue lacus viverra vitae congue. Egestas egestas fringilla phasellus faucibus scelerisque eleifend donec. Nunc aliquet bibendum enim facilisis gravida. Metus vulputate eu scelerisque felis imperdiet proin fermentum. Hac habitasse platea dictumst quisque sagittis purus. Et malesuada fames ac turpis egestas sed. Odio tempor orci dapibus ultrices in iaculis nunc. Odio morbi quis commodo odio aenean sed adipiscing diam donec. At quis risus sed vulputate odio ut. Sed cras ornare arcu dui vivamus arcu felis bibendum. Sit amet cursus sit amet dictum sit amet justo. Imperdiet dui accumsan sit amet nulla facilisi morbi tempus. Tristique risus nec feugiat in fermentum posuere urna nec tincidunt."),
            p("Urna duis convallis convallis tellus id. Et pharetra pharetra massa massa ultricies. Faucibus a pellentesque sit amet porttitor eget dolor morbi. Hendrerit gravida rutrum quisque non tellus orci. Justo nec ultrices dui sapien eget. Leo a diam sollicitudin tempor. Fringilla ut morbi tincidunt augue. In aliquam sem fringilla ut morbi tincidunt. Sollicitudin aliquam ultrices sagittis orci a. Donec enim diam vulputate ut pharetra sit. Aliquet enim tortor at auctor urna nunc id cursus. Pellentesque adipiscing commodo elit at imperdiet. Lacus sed turpis tincidunt id. Sed risus pretium quam vulputate dignissim suspendisse. At tempor commodo ullamcorper a lacus vestibulum sed."),
            p("Quam quisque id diam vel quam elementum pulvinar. Lectus urna duis convallis convallis tellus id interdum velit. Mi sit amet mauris commodo quis. Volutpat odio facilisis mauris sit amet massa vitae tortor. Dui faucibus in ornare quam viverra orci sagittis eu volutpat. Pellentesque massa placerat duis ultricies lacus sed turpis tincidunt. Viverra orci sagittis eu volutpat odio facilisis. Nisi lacus sed viverra tellus in hac. Sed elementum tempus egestas sed sed risus pretium quam vulputate. Eu mi bibendum neque egestas. Nibh sed pulvinar proin gravida hendrerit. Viverra tellus in hac habitasse. Proin libero nunc consequat interdum varius sit amet mattis. Phasellus egestas tellus rutrum tellus pellentesque eu tincidunt tortor.")
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