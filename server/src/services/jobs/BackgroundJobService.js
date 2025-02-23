const schedule = require('node-schedule');

class BackgroundJobService {
    constructor() {
        this.jobs = new Map();
    }

    /**
     * Starts a new job with the given schedule
     * @param {string} jobName - Unique identifier for the job
     * @param {string} cronSchedule - Cron schedule expression
     * @param {Function} taskFunction - The function to execute
     */
    scheduleJob(jobName, cronSchedule, taskFunction) {
        // Cancel existing job if it exists
        if (this.jobs.has(jobName)) {
            this.cancelJob(jobName);
        }

        // Schedule new job
        const job = schedule.scheduleJob(cronSchedule, taskFunction);
        this.jobs.set(jobName, job);
        
        console.log(`Scheduled job: ${jobName} with schedule: ${cronSchedule}`);
    }

    /**
     * Cancels a specific job
     * @param {string} jobName - The name of the job to cancel
     */
    cancelJob(jobName) {
        const job = this.jobs.get(jobName);
        if (job) {
            job.cancel();
            this.jobs.delete(jobName);
            console.log(`Cancelled job: ${jobName}`);
        }
    }

    /**
     * Cancels all running jobs
     */
    cancelAllJobs() {
        for (const [jobName, job] of this.jobs) {
            job.cancel();
            console.log(`Cancelled job: ${jobName}`);
        }
        this.jobs.clear();
    }
}

module.exports = new BackgroundJobService(); 