# WhatsAppBot

A simple and effective WhatsApp bot that allows users to set reminders using the command `remindme TIME MESSAGE` and sends back the reminder at the specified time.

## Features

- **Set Reminders:** Users can set reminders with a specific time and message.
- **Automated Reminders:** The bot automatically sends back the reminder at the specified time.
- **Data Storage:** User data and reminder times are stored securely in a PostgreSQL database.
- **Easy to Use:** Simple command structure for setting reminders.

## Installation

1. Clone the repository:
    ```bash
    git clone https://github.com/mihir2004/whatsappbot.git
    ```
2. Navigate to the project directory:
    ```bash
    cd whatsappbot
    ```
3. Install the dependencies:
    ```bash
    npm install
    ```
4. Set up the PostgreSQL database:
    - Install PostgreSQL if you haven't already.
    - Create a database and user for the project.
    - Update the database configuration in the project.

## Usage

1. Start the server:
    ```bash
    node server.js
    ```
2. Use the `remindme` command in WhatsApp to set a reminder. Supported time formats include:
    - Relative time (e.g., "10m" for 10 minutes)
    - Absolute time (e.g., "9:00 AM" or "23:45")

    Example commands:
    ```plaintext
    remindme 10m Take a break
    remindme 9:00 AM Start meeting
    remindme 23:45 Go to bed
    ```

## Example

To set a reminder for 10 minutes to take a break, send the following message in WhatsApp:
```plaintext
remindme 10m Take a break
```
To set a reminder for 9:00 AM to start a meeting, send the following message in WhatsApp:
```
remindme 9:00 AM Start meeting
```
The bot will send back the reminder at the specified times.

## Contributing

1. Fork the repository.
2. Create a new branch (`git checkout -b feature-branch`).
3. Make your changes.
4. Commit your changes (`git commit -m 'Add new feature'`).
5. Push to the branch (`git push origin feature-branch`).
6. Open a pull request.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

Thanks to the contributors of this project.

## Contact

For any questions or feedback, please open an issue or contact the repository owner.

```css
Feel free to modify this template according to the specific details and requirements of your project.
