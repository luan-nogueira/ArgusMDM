package com.argusmdm.agent.ui

import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.activity.enableEdgeToEdge
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.material3.Surface
import androidx.compose.ui.Modifier
import com.argusmdm.agent.ui.navigation.ArgusNavHost
import com.argusmdm.agent.ui.theme.ArgusMdmTheme
import dagger.hilt.android.AndroidEntryPoint

@AndroidEntryPoint
class MainActivity : ComponentActivity() {

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        enableEdgeToEdge()

        setContent {
            ArgusMdmTheme {
                Surface(modifier = Modifier.fillMaxSize()) {
                    ArgusNavHost()
                }
            }
        }
    }
}
