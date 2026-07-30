package com.argusmdm.agent.data.remote

import com.argusmdm.agent.data.local.prefs.CredentialsCache
import okhttp3.Interceptor
import okhttp3.Response
import javax.inject.Inject

class AuthInterceptor @Inject constructor(
    private val credentialsCache: CredentialsCache,
) : Interceptor {

    override fun intercept(chain: Interceptor.Chain): Response {
        val credentials = credentialsCache.current.value
        val request = if (credentials != null) {
            chain.request().newBuilder()
                .addHeader("X-Device-Id", credentials.deviceId)
                .addHeader("X-Device-Key", credentials.apiKey)
                .build()
        } else {
            chain.request()
        }
        return chain.proceed(request)
    }
}
