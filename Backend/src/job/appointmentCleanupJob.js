const {
    cleanupAppointments
} = require("../services/appointmentCleanupService");

const startAppointmentCleanupJob = () => {

    const CLEANUP_INTERVAL = 5*60 * 1000;  

    const runCleanup = async () => {

        try {

            console.log(
                "[Appointment Cleanup] Job started"
            );

            const result =
                await cleanupAppointments();

            console.log(
                "[Appointment Cleanup] Result:",
                result
            );

        } catch (error) {

            console.error(
                "[Appointment Cleanup] Failed:",
                error.message
            );
        }
    };

    // Run immediately
    runCleanup();

    // Run every 5 minutes
    setInterval(
        runCleanup,
        CLEANUP_INTERVAL
    );
};

module.exports = {
    startAppointmentCleanupJob
}; 