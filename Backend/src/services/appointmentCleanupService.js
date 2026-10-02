
const Appointment = require("../models/Appointment");
const AppointmentArchive = require("../models/AppointmentArchive");


// =========================================================
// CLEANUP EXPIRED PENDING APPOINTMENTS
// =========================================================

const cleanupExpiredPendingAppointments = async () => {

    const now = new Date();

    const expiredAppointments =
        await Appointment.find({
            status: "Pending",
            paymentStatus: "Pending",
            expiresAt: {
                $ne: null,
                $lte: now
            }
        });

    if (expiredAppointments.length === 0) {
        return 0;
    }

    const appointmentIds =
        expiredAppointments.map(
            appointment => appointment._id
        );

    const result =
        await Appointment.deleteMany({
            _id: {
                $in: appointmentIds
            }
        });

    return result.deletedCount;
};

// =========================================================
// ARCHIVE OLD APPOINTMENTS
// ========================================================= 
//
// Confirmed / Completed appointments are archived
// 2 days after their appointment date.
//
// After successful archive:
// Original appointment is deleted from Appointment collection.
//
// =========================================================

const archiveOldAppointments = async () => {

    const archiveBefore = new Date();

    archiveBefore.setDate(
        archiveBefore.getDate() - 2
    );


    const oldAppointments =
        await Appointment.find({
            status: {
                $in: [
                    "Confirmed",
                    "Completed"
                ]
            },

            appointmentDate: {
                $lte: archiveBefore
            }
        });


    if (oldAppointments.length === 0) {
        return 0;
    }


    let archivedCount = 0;


    for (const appointment of oldAppointments) {

        try {

            // =================================================
            // CHECK WHETHER ALREADY ARCHIVED
            // =================================================

            const existingArchive =
                await AppointmentArchive.findOne({
                    originalAppointmentId:
                        appointment._id
                });


            // =================================================
            // IF ALREADY ARCHIVED
            // =================================================
            //
            // This protects against duplicate archive records.
            //
            // =================================================

            if (existingArchive) {

                await Appointment.deleteOne({
                    _id: appointment._id
                });

                archivedCount++;

                continue;
            }


            // =================================================
            // CREATE ARCHIVE RECORD
            // =================================================

            await AppointmentArchive.create({

                originalAppointmentId:
                    appointment._id,

                patient:
                    appointment.patient,

                doctor:
                    appointment.doctor,

                department:
                    appointment.department,

                appointmentDate:
                    appointment.appointmentDate,

                appointmentTime:
                    appointment.appointmentTime,

                reason:
                    appointment.reason,

                consultationType:
                    appointment.consultationType,

                status:
                    appointment.status,

                paymentStatus:
                    appointment.paymentStatus,

                archivedAt:
                    new Date()
            });


            // =================================================
            // DELETE ORIGINAL APPOINTMENT
            // =================================================

            const deleteResult =
                await Appointment.deleteOne({
                    _id: appointment._id
                });


            // =================================================
            // COUNT ONLY IF DELETE WAS SUCCESSFUL
            // =================================================

            if (deleteResult.deletedCount === 1) {

                archivedCount++;

            }

        } catch (error) {

            // =================================================
            // HANDLE DUPLICATE ARCHIVE
            // =================================================

            if (error.code === 11000) {

                try {

                    await Appointment.deleteOne({
                        _id: appointment._id
                    });

                    archivedCount++;

                } catch (deleteError) {

                    console.error(
                        "Appointment cleanup delete failed:",
                        appointment._id,
                        deleteError.message
                    );
                }

                continue;
            }


            // =================================================
            // OTHER ARCHIVE ERRORS
            // =================================================

            console.error(
                "Appointment archive failed:",
                appointment._id,
                error.message
            );
        }
    }


    return archivedCount; 
};

   
// =========================================================
// MAIN APPOINTMENT CLEANUP SERVICE
// =========================================================

const cleanupAppointments = async () => {

    const expiredPendingCount =
        await cleanupExpiredPendingAppointments();


    const archivedCount =
        await archiveOldAppointments();


    return {
        expiredPendingCount,
        archivedCount
    };
};


// =========================================================
// EXPORT
// =========================================================

module.exports = {
    cleanupExpiredPendingAppointments,
    archiveOldAppointments,
    cleanupAppointments
};

