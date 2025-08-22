export function applyStatus(target, statusKey) {
  const statusDef = STATUSES[statusKey];
  if (!statusDef) return;

  // Se è cumulabile → aumenta stack
  const existing = target.statuses.find(s => s.key === statusKey);
  if (existing && statusDef.stackable) {
    existing.stacks = (existing.stacks || 1) + 1;
    existing.duration = statusDef.duration;
  } else {
    const newStatus = {
      key: statusKey,
      duration: statusDef.duration,
      ...JSON.parse(JSON.stringify(statusDef)) // clone
    };
    if (newStatus.effect.onApply) newStatus.effect.onApply(target);
    target.statuses.push(newStatus);
  }
}

export function tickStatuses(event, target) {
  for (let status of target.statuses) {
    if (status.effect[event]) {
      status.effect[event](target, status);
    }
  }
}

export function reduceStatusDuration(target) {
  target.statuses = target.statuses.filter(status => {
    status.duration--;
    if (status.duration <= 0) {
      if (status.effect.onExpire) status.effect.onExpire(target, status);
      return false;
    }
    return true;
  });
}
