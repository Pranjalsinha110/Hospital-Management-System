const { BrevoClient } = require("@getbrevo/brevo");

// =========================================================
// BREVO CLIENT
// =========================================================

const brevoApiKey = process.env.BREVO_API_KEY;
const senderEmail = process.env.BREVO_SENDER_EMAIL;
const senderName =
    process.env.BREVO_SENDER_NAME ||
    "Hospital Management";

if (!brevoApiKey) {
    throw new Error(
        "BREVO_API_KEY is not configured"
    );
}

if (!senderEmail) {
    throw new Error(
        "BREVO_SENDER_EMAIL is not configured"
    );
}

const brevo = new BrevoClient({
    apiKey: brevoApiKey
});

// =========================================================
// EMAIL VALIDATION
// =========================================================

const isValidEmail = (email) => {
    if (!email || typeof email !== "string") {
        return false;
    }

    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(
        email.trim()
    );
};

// =========================================================
// HTML ESCAPE
// Prevents user/database values from being injected
// into the email HTML.
// =========================================================

const escapeHtml = (value = "") => {
    return String(value)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
};

// =========================================================
// DATE FORMATTER
// Appointment date is stored with IST information.
// =========================================================

const formatAppointmentDate = (date) => {
    if (!date) {
        return "N/A";
    }

    return new Intl.DateTimeFormat(
        "en-IN",
        {
            timeZone: "Asia/Kolkata",
            day: "2-digit",
            month: "long",
            year: "numeric"
        }
    ).format(new Date(date));
};

// =========================================================
// TIME FORMATTER
// Converts HH:mm into 12-hour format.
// =========================================================

const formatAppointmentTime = (time) => {
    if (!time) {
        return "N/A";
    }

    const [hours, minutes] =
        time.split(":").map(Number);

    if (
        Number.isNaN(hours) ||
        Number.isNaN(minutes)
    ) {
        return time;
    }

    const period =
        hours >= 12 ? "PM" : "AM";

    const displayHours =
        hours % 12 || 12;

    return `${displayHours}:${String(minutes).padStart(2, "0")} ${period}`;
};

// =========================================================
// COMMON EMAIL SENDER
// All Brevo communication goes through this function.
// =========================================================

const sendEmail = async ({
    toEmail,
    toName,
    subject,
    htmlContent,
    textContent
}) => {
    if (!isValidEmail(toEmail)) {
        throw new Error(
            `Invalid recipient email address: ${toEmail || "missing"}`
        );
    }

    if (!subject) {
        throw new Error(
            "Email subject is required"
        );
    }

    if (!htmlContent && !textContent) {
        throw new Error(
            "Email content is required"
        );
    }

    const emailData = {
        subject,

        sender: {
            name: senderName,
            email: senderEmail
        },

        to: [
            {
                email: toEmail.trim(),
                ...(toName
                    ? {
                          name: toName.trim()
                      }
                    : {})
            }
        ]
    };

    if (htmlContent) {
        emailData.htmlContent =
            htmlContent;
    }

    if (textContent) {
        emailData.textContent =
            textContent;
    }

    return brevo.transactionalEmails.sendTransacEmail(
        emailData
    );
};

// =========================================================
// PATIENT APPOINTMENT CONFIRMATION EMAIL
// =========================================================

const sendPatientAppointmentConfirmation =
    async (appointment) => {
        const patientUser =
            appointment?.patient?.user;

        const doctorUser =
            appointment?.doctor?.user;

        const department =
            appointment?.department;

        if (!patientUser) {
            throw new Error(
                "Patient user information is missing"
            );
        }

        if (!isValidEmail(patientUser.email)) {
            throw new Error(
                "Patient email address is missing or invalid"
            );
        }

        const patientName =
            escapeHtml(
                patientUser.name ||
                    "Patient"
            );

        const doctorName =
            escapeHtml(
                doctorUser?.name ||
                    "Doctor"
            );

        const departmentName =
            escapeHtml(
                department?.name ||
                    "N/A"
            );

        const appointmentDate =
            escapeHtml(
                formatAppointmentDate(
                    appointment.appointmentDate
                )
            );

        const appointmentTime =
            escapeHtml(
                formatAppointmentTime(
                    appointment.appointmentTime
                )
            );

        const consultationType =
            escapeHtml(
                appointment.consultationType ||
                    "In-Person"
            );

        const appointmentId =
            escapeHtml(
                appointment._id.toString()
            );

        const subject =
            "Appointment Confirmed - Hospital Management System";

        const htmlContent = `
<!DOCTYPE html>
<html>

<head>
    <meta charset="UTF-8">
    <meta
        name="viewport"
        content="width=device-width, initial-scale=1.0"
    >

    <title>${subject}</title>
</head>

<body
    style="
        margin:0;
        padding:0;
        background:#f5f7fa;
        font-family:Arial,Helvetica,sans-serif;
    "
>

    <div
        style="
            max-width:600px;
            margin:30px auto;
            background:#ffffff;
            border-radius:8px;
            overflow:hidden;
            border:1px solid #e5e7eb;
        "
    >

        <div
            style="
                padding:24px;
                background:#1f2937;
                color:#ffffff;
            "
        >
            <h2 style="margin:0;">
                Appointment Confirmed
            </h2>
        </div>

        <div style="padding:24px;">

            <p
                style="
                    font-size:16px;
                    margin-top:0;
                "
            >
                Dear ${patientName},
            </p>

            <p
                style="
                    font-size:15px;
                    line-height:1.6;
                "
            >
                Your appointment has been successfully
                confirmed after successful payment.
            </p>

            <div
                style="
                    margin:24px 0;
                    padding:18px;
                    background:#f9fafb;
                    border:1px solid #e5e7eb;
                    border-radius:6px;
                "
            >

                <p style="margin:8px 0;">
                    <strong>Doctor:</strong>
                    ${doctorName}
                </p>

                <p style="margin:8px 0;">
                    <strong>Department:</strong>
                    ${departmentName}
                </p>

                <p style="margin:8px 0;">
                    <strong>Date:</strong>
                    ${appointmentDate}
                </p>

                <p style="margin:8px 0;">
                    <strong>Time:</strong>
                    ${appointmentTime}
                </p>

                <p style="margin:8px 0;">
                    <strong>Consultation:</strong>
                    ${consultationType}
                </p>

                <p style="margin:8px 0;">
                    <strong>Payment:</strong>
                    Paid
                </p>

                <p style="margin:8px 0;">
                    <strong>Appointment ID:</strong>
                    ${appointmentId}
                </p>

            </div>

            <p
                style="
                    font-size:14px;
                    line-height:1.6;
                    color:#4b5563;
                "
            >
                Please keep this email for your appointment
                reference.
            </p>

            <p
                style="
                    font-size:14px;
                    color:#4b5563;
                "
            >
                Regards,<br>
                ${escapeHtml(senderName)}
            </p>

        </div>
    </div>

</body>

</html>
`;

        const textContent = `
Appointment Confirmed

Dear ${patientUser.name || "Patient"},

Your appointment has been successfully confirmed after successful payment.

Doctor: ${doctorUser?.name || "Doctor"}
Department: ${department?.name || "N/A"}
Date: ${formatAppointmentDate(appointment.appointmentDate)}
Time: ${formatAppointmentTime(appointment.appointmentTime)}
Consultation: ${appointment.consultationType || "In-Person"}
Payment: Paid
Appointment ID: ${appointment._id}

Regards,
${senderName}
`;

        return sendEmail({
            toEmail: patientUser.email,
            toName: patientUser.name,
            subject,
            htmlContent,
            textContent
        });
    };

// =========================================================
// DOCTOR NEW APPOINTMENT EMAIL
// =========================================================

const sendDoctorAppointmentNotification =
    async (appointment) => {
        const patientUser =
            appointment?.patient?.user;

        const doctorUser =
            appointment?.doctor?.user;

        const department =
            appointment?.department;

        if (!doctorUser) {
            throw new Error(
                "Doctor user information is missing"
            );
        }

        if (!isValidEmail(doctorUser.email)) {
            throw new Error(
                "Doctor email address is missing or invalid"
            );
        }

        const doctorName =
            escapeHtml(
                doctorUser.name ||
                    "Doctor"
            );

        const patientName =
            escapeHtml(
                patientUser?.name ||
                    "Patient"
            );

        const departmentName =
            escapeHtml(
                department?.name ||
                    "N/A"
            );

        const appointmentDate =
            escapeHtml(
                formatAppointmentDate(
                    appointment.appointmentDate
                )
            );

        const appointmentTime =
            escapeHtml(
                formatAppointmentTime(
                    appointment.appointmentTime
                )
            );

        const consultationType =
            escapeHtml(
                appointment.consultationType ||
                    "In-Person"
            );

        const appointmentId =
            escapeHtml(
                appointment._id.toString()
            );

        const subject =
            "New Appointment Booked - Hospital Management System";

        const htmlContent = `
<!DOCTYPE html>
<html>

<head>
    <meta charset="UTF-8">

    <meta
        name="viewport"
        content="width=device-width, initial-scale=1.0"
    >

    <title>${subject}</title>
</head>

<body
    style="
        margin:0;
        padding:0;
        background:#f5f7fa;
        font-family:Arial,Helvetica,sans-serif;
    "
>

    <div
        style="
            max-width:600px;
            margin:30px auto;
            background:#ffffff;
            border-radius:8px;
            overflow:hidden;
            border:1px solid #e5e7eb;
        "
    >

        <div
            style="
                padding:24px;
                background:#1f2937;
                color:#ffffff;
            "
        >
            <h2 style="margin:0;">
                New Appointment Booked
            </h2>
        </div>

        <div style="padding:24px;">

            <p
                style="
                    font-size:16px;
                    margin-top:0;
                "
            >
                Dear Dr. ${doctorName},
            </p>

            <p
                style="
                    font-size:15px;
                    line-height:1.6;
                "
            >
                A new appointment has been booked
                and payment has been successfully completed.
            </p>

            <div
                style="
                    margin:24px 0;
                    padding:18px;
                    background:#f9fafb;
                    border:1px solid #e5e7eb;
                    border-radius:6px;
                "
            >

                <p style="margin:8px 0;">
                    <strong>Patient:</strong>
                    ${patientName}
                </p>

                <p style="margin:8px 0;">
                    <strong>Department:</strong>
                    ${departmentName}
                </p>

                <p style="margin:8px 0;">
                    <strong>Date:</strong>
                    ${appointmentDate}
                </p>

                <p style="margin:8px 0;">
                    <strong>Time:</strong>
                    ${appointmentTime}
                </p>

                <p style="margin:8px 0;">
                    <strong>Consultation:</strong>
                    ${consultationType}
                </p>

                <p style="margin:8px 0;">
                    <strong>Payment:</strong>
                    Paid
                </p>

                <p style="margin:8px 0;">
                    <strong>Appointment ID:</strong>
                    ${appointmentId}
                </p>

            </div>

            <p
                style="
                    font-size:14px;
                    line-height:1.6;
                    color:#4b5563;
                "
            >
                Please review the appointment details
                through the hospital management system.
            </p>

            <p
                style="
                    font-size:14px;
                    color:#4b5563;
                "
            >
                Regards,<br>
                ${escapeHtml(senderName)}
            </p>

        </div>
    </div>

</body>

</html>
`;

        const textContent = `
New Appointment Booked

Dear Dr. ${doctorUser.name || "Doctor"},

A new appointment has been booked and payment has been successfully completed.

Patient: ${patientUser?.name || "Patient"}
Department: ${department?.name || "N/A"}
Date: ${formatAppointmentDate(appointment.appointmentDate)}
Time: ${formatAppointmentTime(appointment.appointmentTime)}
Consultation: ${appointment.consultationType || "In-Person"}
Payment: Paid
Appointment ID: ${appointment._id}

Regards,
${senderName}
`;

        return sendEmail({
            toEmail: doctorUser.email,
            toName: doctorUser.name,
            subject,
            htmlContent,
            textContent
        });
    };

// =========================================================
// APPOINTMENT NOTIFICATION SERVICE
//
// Sends:
// 1. Patient confirmation
// 2. Doctor notification
//
// Promise.allSettled ensures that failure of one email
// does not prevent the other email from being attempted.
// =========================================================

const sendAppointmentConfirmationNotifications =
    async (appointment) => {
        if (!appointment) {
            throw new Error(
                "Appointment data is required"
            );
        }

        const results =
            await Promise.allSettled([
                sendPatientAppointmentConfirmation(
                    appointment
                ),

                sendDoctorAppointmentNotification(
                    appointment
                )
            ]);

        const patientResult =
            results[0];

        const doctorResult =
            results[1];

        return {
            patient: {
                success:
                    patientResult.status ===
                    "fulfilled",

                error:
                    patientResult.status ===
                    "rejected"
                        ? patientResult.reason
                              ?.message ||
                          "Patient email failed"
                        : null
            },

            doctor: {
                success:
                    doctorResult.status ===
                    "fulfilled",

                error:
                    doctorResult.status ===
                    "rejected"
                        ? doctorResult.reason
                              ?.message ||
                          "Doctor email failed"
                        : null
            },

            allSuccessful:
                patientResult.status ===
                    "fulfilled" &&
                doctorResult.status ===
                    "fulfilled"
        };
    };

// =========================================================
// EXPORTS
// =========================================================

module.exports = {
    sendEmail,
    sendPatientAppointmentConfirmation,
    sendDoctorAppointmentNotification,
    sendAppointmentConfirmationNotifications
};