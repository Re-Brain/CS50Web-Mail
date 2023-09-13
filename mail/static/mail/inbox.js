document.addEventListener("DOMContentLoaded", function () {
  // Use buttons to toggle between views
  document
    .querySelector("#inbox")
    .addEventListener("click", () => load_mailbox("inbox"));
  document
    .querySelector("#sent")
    .addEventListener("click", () => load_mailbox("sent"));
  document
    .querySelector("#archived")
    .addEventListener("click", () => load_mailbox("archive"));
  document.querySelector("#compose").addEventListener("click", compose_email);
  document
    .querySelector("#compose-form")
    .addEventListener("submit", send_email);

  // By default, load the inbox
  load_mailbox("inbox");

  document.querySelectorAll(".email").addEventListener("click", function () {
    load_page(document.querySelectorAll(".email").querySelector("#id").value);
  });
});

function compose_email() {
  // Show compose view and hide other views
  document.querySelector("#emails-view").style.display = "none";
  document.querySelector("#compose-view").style.display = "block";
  document.querySelector("#content-view").style.display = "none";

  // Clear out composition fields
  document.querySelector("#compose-recipients").value = "";
  document.querySelector("#compose-subject").value = "";
  document.querySelector("#compose-body").value = "";
}

function load_mailbox(mailbox) {
  // Show the mailbox and hide other views
  document.querySelector("#emails-view").style.display = "block";
  document.querySelector("#compose-view").style.display = "none";
  document.querySelector("#content-view").style.display = "none";

  // Show the mailbox name
  document.querySelector("#emails-view").innerHTML = `<h3>${
    mailbox.charAt(0).toUpperCase() + mailbox.slice(1)
  }</h3>`;

  console.log(mailbox);

  fetch(`/emails/${mailbox}`)
    .then((response) => response.json())
    .then((emails) => {
      // Print emails
      console.log(emails);

      for (const message of emails) {
        const element = document.createElement("div");
        element.className = "email";
        element.addEventListener("click", () => load_page(message.id));
        element.innerHTML = `<input type="hidden" id="id" value="${message.id}">`;

        const leftDiv = document.createElement("div");
        leftDiv.className = "email-left";
        leftDiv.innerHTML = `<ul>
        <li><p><strong>${message.sender}</strong></p></li>
        <li><p>${message.subject}</p></li>
        </ul>`;

        const rightDiv = document.createElement("div");
        rightDiv.className = "email-right";
        rightDiv.innerHTML = `<p>${message.timestamp}</p>`;

        element.appendChild(leftDiv);
        element.appendChild(rightDiv);

        document.querySelector("#emails-view").append(element);
      }
    });
}

function send_email(event) {
  event.preventDefault(); // Prevents the default form submission behavior

  let recipients = document.querySelector("#compose-recipients").value;
  let subject = document.querySelector("#compose-subject").value;
  let body = document.querySelector("#compose-body").value;

  fetch("/emails", {
    method: "POST",
    body: JSON.stringify({
      recipients: recipients,
      subject: subject,
      body: body,
    }),
  })
    .then((response) => response.json())
    .then((result) => {
      console.log(result);
    });

  document.querySelector("#compose-recipients").value = "";
  document.querySelector("#compose-subject").value = "";
  document.querySelector("#compose-body").value = "";
}

function load_page(id) {
  // Create another div in inbox.html for reading the mail, use the style.display technique from load mailbox, and generate the html with
  // js
  document.querySelector("#emails-view").style.display = "none";
  document.querySelector("#compose-view").style.display = "none";
  document.querySelector("#content-view").style.display = "block";

  document.querySelector("#content-view").innerHTML = "";

  fetch(`/emails/${id}`, {
    method: "PUT",
    body: JSON.stringify({
      read: true,
    }),
  });

  fetch(`/emails/${id}`)
    .then((response) => response.json())
    .then((email) => {
      // Print email
      console.log(email);

      const element = document.createElement("div");
      element.innerHTML = `<ul class="content">
        <li class="content-header"><p><strong>From:</strong> ${email.sender}</p></li>
        <li class="content-header"><p><strong>To:</strong> ${email.recipients}</p></li>
        <li class="content-header"><p><strong>Subject:</strong> ${email.subject}</p></li>
        <li class="content-header"><p><strong>Timestamp:</strong> ${email.timestamp}</p></li>
      </ul>`;

      const buttonContainer = document.createElement("div");

      const archive = document.createElement("button");
      archive.addEventListener("click", () => archiveStatus(id));
      archive.innerHTML = email.archived
        ? (archive.innerHTML = "Unarchive")
        : (archive.innerHTML = "Archive");
      buttonContainer.appendChild(archive);

      const reply = document.createElement("button");
      archive.addEventListener("click", () => replyEmail(email));
      archive.innerHTML = "Reply";
      buttonContainer.appendChild(reply);

      const hr = document.createElement("hr");
      const body = document.createElement("p");
      body.innerHTML = `${email.body}`;

      element.append(buttonContainer);
      element.append(hr);
      element.append(body);

      document.querySelector("#content-view").append(element);
    });
}

function archiveStatus(id) {
  fetch(`/emails/${id}`)
    .then((response) => response.json())
    .then((email) => {
      console.log(email.archived);
      if (email.archived) {
        fetch(`/emails/${id}`, {
          method: "PUT",
          body: JSON.stringify({
            archived: false,
          }),
        });
        load_mailbox("inbox");
      } else {
        fetch(`/emails/${id}`, {
          method: "PUT",
          body: JSON.stringify({
            archived: true,
          }),
        });
        load_mailbox("inbox");
      }
    });
}

function replyEmail(email)
{
  document.querySelector("#emails-view").style.display = "none";
  document.querySelector("#compose-view").style.display = "block";
  document.querySelector("#content-view").style.display = "none";  
}