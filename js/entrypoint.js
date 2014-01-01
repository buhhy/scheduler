$(function () {
    new Scheduler.views.Calendar({
        "el": "#scheduleContainer",
        "startTime": 9 * 60,
        "endTime": 22 * 60 + 30,
        "model": new Scheduler.models.SectionCollection()
    });
});
