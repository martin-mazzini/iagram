const cron = require('node-cron');
const AIPostGenerationJob = require('./AIPostGenerationJob');
const AICommentGenerationJob = require('./AICommentGenerationJob');
const AIUserGenerationJob = require('./AIUserGenerationJob');

class BackgroundJobService {
    constructor() {
        this.jobs = {};
    }

    
    initialize() {
        this.setupPostGenerationJob();
        this.setupCommentGenerationJob();
        this.setupUserGenerationJob();
        console.log('Background jobs initialized');
    }

    setupPostGenerationJob() {
        const enabled = process.env.POST_JOB_ENABLED === 'true';
        const cronSchedule = process.env.POST_JOB_CRON || '0 */2 * * *'; // Default: every 2 hours
        
        console.log('\n=== AI Post Generation Job Configuration ===');
        console.log(`POST_JOB_ENABLED: ${enabled}`);
        console.log(`POST_JOB_CRON: ${cronSchedule}`);
        console.log(`Job will run: ${enabled ? 'YES' : 'NO'}`);
        console.log('==========================================\n');
        
        if (enabled) {
            console.log(`Scheduling AI Post Generation Job with cron: ${cronSchedule}`);
            this.scheduleJob('aiPostGeneration', cronSchedule, AIPostGenerationJob.execute);
        } else {
            console.log('AI Post Generation Job is disabled via POST_JOB_ENABLED environment variable\n');
        }
    }

    setupCommentGenerationJob() {
        const enabled = process.env.COMMENT_JOB_ENABLED === 'true';
        const cronSchedule = process.env.COMMENT_JOB_CRON || '*/5 * * * *'; // Default: every 5 minutes
        
        console.log('\n=== AI Comment Generation Job Configuration ===');
        console.log(`COMMENT_JOB_ENABLED: ${enabled}`);
        console.log(`COMMENT_JOB_CRON: ${cronSchedule}`);
        console.log(`Job will run: ${enabled ? 'YES' : 'NO'}`);
        console.log('==========================================\n');
        
        if (enabled) {
            console.log(`Scheduling AI Comment Generation Job with cron: ${cronSchedule}`);
            this.scheduleJob('aiCommentGeneration', cronSchedule, AICommentGenerationJob.execute);
        } else {
            console.log('AI Comment Generation Job is disabled via COMMENT_JOB_ENABLED environment variable\n');
        }
    }

    setupUserGenerationJob() {
        const enabled = process.env.USER_JOB_ENABLED === 'true';
        const cronSchedule = process.env.USER_JOB_CRON || '*/10 * * * * *'; // Default: every 10 seconds
        
        console.log('\n=== AI User Generation Job Configuration ===');
        console.log(`USER_JOB_ENABLED: ${enabled}`);
        console.log(`USER_JOB_CRON: ${cronSchedule}`);
        console.log(`Job will run: ${enabled ? 'YES' : 'NO'}`);
        console.log('==========================================\n');
        
        if (enabled) {
            console.log(`Scheduling AI User Generation Job with cron: ${cronSchedule}`);
            this.scheduleJob('aiUserGeneration', cronSchedule, AIUserGenerationJob.execute);
        } else {
            console.log('AI User Generation Job is disabled via USER_JOB_ENABLED environment variable\n');
        }
    }

    scheduleJob(name, cronSchedule, jobFunction) {
        if (cron.validate(cronSchedule)) {
            this.jobs[name] = cron.schedule(cronSchedule, jobFunction);
            console.log(`Scheduled job: ${name} with schedule: ${cronSchedule}`);
        } else {
            console.error(`Invalid cron schedule for ${name}: ${cronSchedule}`);
        }
    }

    /**
     * Cancels a specific job
     * @param {string} jobName - The name of the job to cancel
     */
    cancelJob(jobName) {
        const job = this.jobs[jobName];
        if (job) {
            job.stop();
            delete this.jobs[jobName];
            console.log(`Cancelled job: ${jobName}`);
        }
    }

    /**
     * Cancels all running jobs
     */
    cancelAllJobs() {
        for (const jobName in this.jobs) {
            this.cancelJob(jobName);
        }
        this.jobs = {};
    }
}

module.exports = new BackgroundJobService(); 