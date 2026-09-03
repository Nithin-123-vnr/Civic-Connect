import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';

admin.initializeApp();
const db = admin.firestore();

export const onComplaintCreated = functions.firestore
  .document('complaints/{complaintId}')
  .onCreate(async (snap, context) => {
    const data = snap.data();
    const complaintId = context.params.complaintId;

    await db.collection('notifications').add({
      userId: data.assignedTo || 'mandal-helpdesk',
      type: 'new_complaint',
      title: `New Grievance Filed: ${data.referenceId}`,
      body: `${data.title} reported in ${data.areaName}, ${data.mandalName}`,
      complaintId,
      complaintRef: data.referenceId,
      isRead: false,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    });
  });

export const onComplaintUpdated = functions.firestore
  .document('complaints/{complaintId}')
  .onUpdate(async (change, context) => {
    const before = change.before.data();
    const after = change.after.data();
    const complaintId = context.params.complaintId;

    if (before.status !== after.status) {
      await db.collection('notifications').add({
        userId: after.citizenId,
        type: after.status === 'resolved' ? 'complaint_resolved' : 'complaint_status_update',
        title: `Status Update: ${after.referenceId}`,
        body: `Your grievance is now marked as "${after.status}".`,
        complaintId,
        complaintRef: after.referenceId,
        isRead: false,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
      });
    }
  });

export const checkSLAAndEscalate = functions.pubsub
  .schedule('every 1 hours')
  .onRun(async () => {
    const now = Date.now();
    const snap = await db
      .collection('complaints')
      .where('status', 'in', ['pending', 'assigned', 'in_progress'])
      .get();

    const batch = db.batch();

    snap.docs.forEach((docSnap) => {
      const data = docSnap.data();
      const createdTime = data.createdAt ? new Date(data.createdAt).getTime() : now;
      const hoursElapsed = (now - createdTime) / (1000 * 60 * 60);

      let threshold = 72;
      if (data.priority === 'critical') threshold = 24;
      else if (data.priority === 'high') threshold = 48;
      else if (data.priority === 'low') threshold = 120;

      if (hoursElapsed > threshold && data.escalationLevel === 0) {
        batch.update(docSnap.ref, {
          status: 'escalated',
          escalationLevel: 1,
          escalatedAt: admin.firestore.FieldValue.serverTimestamp(),
          updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        });
      }
    });

    await batch.commit();
  });
