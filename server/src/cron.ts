import { Job } from "node-schedule";

interface TaskOptions {
  rule: string;
}

interface Task {
  task: () => Promise<void>;
  options: TaskOptions;
}

export default class CronService {
  private jobSpecs: Array<{ job: Job; options: TaskOptions; name: string }>;
  private isRunning: boolean;

  constructor() {
    this.jobSpecs = [];
    this.isRunning = false;
  }

  add(tasks: { [key: string]: Task } = {}) {
    for (const taskExpression of Object.keys(tasks)) {
      const taskValue = tasks[taskExpression];
      let fn, options, taskName;

      if (typeof taskValue.task !== "function") {
        throw new Error(`${taskExpression} is not a function`);
      }

      fn = taskValue.task.bind(taskValue);
      options = taskValue.options;
      taskName = taskExpression;

      const job = new Job(taskName, fn);
      this.jobSpecs.push({ job, options, name: taskName });

      if (this.isRunning) job.schedule(options.rule);
    }
    return this;
  }

  start() {
    for (let task of this.jobSpecs) {
      task.job.schedule(task.options.rule);
    }

    this.isRunning = true;

    return this;
  }
}
