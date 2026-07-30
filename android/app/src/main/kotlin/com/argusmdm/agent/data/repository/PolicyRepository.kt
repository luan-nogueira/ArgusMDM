package com.argusmdm.agent.data.repository

import com.argusmdm.agent.data.remote.api.ArgusSyncApi
import com.argusmdm.agent.data.remote.dto.PolicyResponse
import com.argusmdm.agent.policy.DevicePolicyManagerHelper
import timber.log.Timber
import javax.inject.Inject
import javax.inject.Singleton

@Singleton
class PolicyRepository @Inject constructor(
    private val api: ArgusSyncApi,
    private val devicePolicyManagerHelper: DevicePolicyManagerHelper,
) {

    suspend fun fetchAndApply(): PolicyResponse? {
        val policy = try {
            api.getPolicy()
        } catch (e: Exception) {
            Timber.w(e, "Falha ao buscar política efetiva; mantendo a última aplicada")
            return null
        }
        if (policy != null) {
            devicePolicyManagerHelper.apply(policy)
        }
        return policy
    }
}
