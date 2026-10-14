const Notification = require('../models/Notification');

// @desc    Get notifications for user and role
// @route   GET /api/notifications
// @access  Private
const getNotifications = async (req, res, next) => {
  try {
    const notifications = await Notification.find({
      $or: [
        { recipient: req.user._id },
        { role: req.user.role },
        { role: 'all' },
      ],
    })
      .sort({ createdAt: -1 })
      .limit(30);

    const unreadCount = notifications.filter(
      (n) => !n.isRead && !n.readBy.some((id) => id.toString() === req.user._id.toString())
    ).length;

    res.json({
      success: true,
      unreadCount,
      data: notifications,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Mark notification as read
// @route   PATCH /api/notifications/:id/read
// @access  Private
const markAsRead = async (req, res, next) => {
  try {
    const notification = await Notification.findById(req.params.id);
    if (!notification) {
      return res.status(404).json({ success: false, message: 'Notification not found' });
    }

    if (!notification.readBy.includes(req.user._id)) {
      notification.readBy.push(req.user._id);
    }
    notification.isRead = true;
    await notification.save();

    res.json({ success: true, message: 'Marked as read' });
  } catch (err) {
    next(err);
  }
};

// @desc    Mark all user notifications as read
// @route   PATCH /api/notifications/read-all
// @access  Private
const markAllAsRead = async (req, res, next) => {
  try {
    await Notification.updateMany(
      {
        $or: [
          { recipient: req.user._id },
          { role: req.user.role },
          { role: 'all' },
        ],
      },
      {
        $addToSet: { readBy: req.user._id },
        $set: { isRead: true },
      }
    );

    res.json({ success: true, message: 'All notifications marked as read' });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getNotifications,
  markAsRead,
  markAllAsRead,
};
