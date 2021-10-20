# Interactive presentation

The project is showcasing an interactive presentation, where the instructor can present various questions for the audience. The audience can answer the questions and the results are updated real time on the results page.

The admin can:
- Add new questions
- Delete questions
- Set the current question that is presented on the screen
- Reset the answers of each question

Everyone can:
- Answer the current question
- See the results of the current question

The admin page uses basic authentication where:
- username: admin
- password: admin

The main page will "block" the ability to answer a question multiple times by a single person. For demo purposes the page can be refreshed and the question can be answered again.

# Main endpoints:
| Method | Endpoint | Description                             |
|--------|----------|-----------------------------------------|
| GET    | /        | See the current question                |
| GET    | /admin   | Admin page                              |
| GET    | /result  | See the results of the current question |
