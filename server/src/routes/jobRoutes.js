const express = require('express');
const router = express.Router();
const BackgroundJobService = require('../services/jobs/BackgroundJobService');
const AIPostGenerationJob = require('../services/jobs/AIPostGenerationJob');
const AICommentGenerationJob = require('../services/jobs/AICommentGenerationJob');
const AIUserGenerationJob = require('../services/jobs/AIUserGenerationJob');

// Map job types to their configuration
const JOB_CONFIG = {
    posts: {
        name: 'aiPostGeneration',
        envEnabled: 'POST_JOB_ENABLED',
        envCron: 'POST_JOB_CRON',
        defaultCron: '0 */2 * * *',
        jobFunction: AIPostGenerationJob.execute
    },
    comments: {
        name: 'aiCommentGeneration',
        envEnabled: 'COMMENT_JOB_ENABLED',
        envCron: 'COMMENT_JOB_CRON',
        defaultCron: '*/5 * * * *',
        jobFunction: AICommentGenerationJob.execute
    },
    users: {
        name: 'aiUserGeneration',
        envEnabled: 'USER_JOB_ENABLED',
        envCron: 'USER_JOB_CRON',
        defaultCron: '*/10 * * * * *',
        jobFunction: AIUserGenerationJob.execute
    }
};

router.get('/:jobType', (req, res) => {
    const { jobType } = req.params;
    const { enabled } = req.query;

    // Validate job type
    if (!JOB_CONFIG[jobType]) {
        return res.status(400).json({ error: `Invalid job type. Must be one of: ${Object.keys(JOB_CONFIG).join(', ')}` });
    }

    // Validate enabled parameter
    if (enabled === undefined || !['true', 'false'].includes(enabled)) {
        return res.status(400).json({ error: 'enabled query parameter must be true or false' });
    }

    try {
        const config = JOB_CONFIG[jobType];
        const jobName = config.name;

        if (enabled === 'true') {
            // Get cron schedule from environment or use default
            const cronSchedule = process.env[config.envCron] || config.defaultCron;
            
            // Update environment variable
            process.env[config.envEnabled] = 'true';

            // Cancel existing job if it exists
            BackgroundJobService.cancelJob(jobName);

            // Schedule new job using the scheduleJob method
            BackgroundJobService.scheduleJob(jobName, cronSchedule, config.jobFunction);

            res.json({ 
                message: `${jobType} job enabled successfully`,
                cronSchedule
            });
        } else {
            // Update environment variable
            process.env[config.envEnabled] = 'false';

            // Cancel the job
            BackgroundJobService.cancelJob(jobName);

            res.json({ message: `${jobType} job disabled successfully` });
        }
    } catch (error) {
        console.error(`Error updating ${jobType} job status:`, error);
        res.status(500).json({ error: `Failed to update ${jobType} job status` });
    }
});

module.exports = router; 