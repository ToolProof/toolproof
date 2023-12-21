import type { NextApiRequest, NextApiResponse } from "next";

type Data = {
    message: string;
    error?: string;
  }

export default async function handler(req: NextApiRequest, res: NextApiResponse<Data>) {
  if (req.method === "POST") {

    const { email, invitationLink } = req.body;

    try {
      // Define the email details
      const emailData = {
        sender: {  
          name: "toolproof.com",
          email: "invite@toolproof.com"
        },
        to: [{  
          name: "Guest",
          email: email
        }],
        subject: "Invite to join a debate",
        htmlContent: `<html><head></head><body>
                        <p>Hello,</p>
                        <p>You have been invited to join a debate. Please click the link below to participate:</p>
                        <p><a href="${invitationLink}">${invitationLink}</a></p>
                      </body></html>`
      };
      
      // Send the request using fetch
      const response = await fetch("https://api.brevo.com/v3/smtp/email", {
        method: "POST",
        headers: {
          "accept": "application/json",
          "content-type": "application/json",
          "api-key": process.env.BREVO_API_KEY || "" // Ensure your API key is correctly set in your .env.local file
        },
        body: JSON.stringify(emailData)
      });

      if (!response.ok) {
        const errorResponse = await response.json();
        console.error("Error response from Brevo:", errorResponse);
        throw new Error(`Failed to send email: ${response.status}`);
      }
      
      res.status(200).json({ message: "Email sent successfully"});
    } catch (error: unknown) {
        console.error("Fetch error:", error);
  
        // Check if error is an instance of Error
        if (error instanceof Error) {
          res.status(500).json({ error: "Error sending email", message: error.message });
        } else {
          res.status(500).json({ error: "Error sending email", message: "Unknown error occurred" });
        }
      }
    } else {
      res.status(405).json({ error: "Method not allowed", message: "Request method is not supported" });
    }
  }