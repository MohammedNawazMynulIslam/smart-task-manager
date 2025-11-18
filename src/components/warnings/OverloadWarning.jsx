function OverloadWarning({ overloadWarning, getAdjustedLoad, assignAnyway, chooseAnotherMember }) {
  if (!overloadWarning) return null
  const currentLoad = getAdjustedLoad(overloadWarning.member.id)

  return (
    <div className="panel warning">
      <strong>
        {overloadWarning.member.name} has {currentLoad} task(s) but capacity is{' '}
        {overloadWarning.member.capacity}. Assign anyway?
      </strong>
      <div className="warning-actions">
        <button className="btn primary" onClick={assignAnyway}>
          Assign anyway
        </button>
        <button className="btn ghost" onClick={chooseAnotherMember}>
          Choose another
        </button>
      </div>
    </div>
  )
}

export default OverloadWarning

