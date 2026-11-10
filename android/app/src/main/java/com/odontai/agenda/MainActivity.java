package com.odontai.agenda;

import android.app.Activity;
import android.os.Bundle;
import android.webkit.WebChromeClient;
import android.webkit.WebResourceRequest;
import android.webkit.WebView;
import android.webkit.WebViewClient;
import android.webkit.WebSettings;
import android.widget.LinearLayout;
import android.widget.TextView;
import android.graphics.Color;
import android.net.Uri;
import android.content.Intent;
import android.view.ViewGroup;
import android.view.View;

public class MainActivity extends Activity {
    private WebView view;
    private String appOrigin;

    @Override public void onCreate(Bundle b) {
        super.onCreate(b);
        getWindow().setStatusBarColor(Color.rgb(14,110,126));
        getWindow().setNavigationBarColor(Color.rgb(242,247,248));
        String target=getString(R.string.app_url);
        if (!target.startsWith("https://") || target.contains("SEU-DOMINIO")) {
            TextView warning=new TextView(this);
            warning.setText("Odontoai precisa ser configurado. Defina a URL HTTPS do servidor em res/values/strings.xml e gere uma nova versão.");
            warning.setTextSize(18); warning.setPadding(32,80,32,32);
            setContentView(warning); return;
        }
        appOrigin=Uri.parse(target).getScheme()+"://"+Uri.parse(target).getAuthority();
        view = new WebView(this);
        view.setBackgroundColor(Color.rgb(242,247,248));
        view.getSettings().setJavaScriptEnabled(true);
        view.getSettings().setDomStorageEnabled(true);
        view.getSettings().setMixedContentMode(WebSettings.MIXED_CONTENT_NEVER_ALLOW);
        view.getSettings().setAllowFileAccess(false);
        view.getSettings().setAllowContentAccess(false);
        view.setWebChromeClient(new WebChromeClient());
        view.setWebViewClient(new WebViewClient() {
            @Override public boolean shouldOverrideUrlLoading(WebView v, WebResourceRequest req) {
                Uri uri=req.getUrl();
                if (uri.toString().startsWith(appOrigin+"/") || uri.toString().equals(appOrigin)) return false;
                if (req.isForMainFrame()) {
                    try {startActivity(new Intent(Intent.ACTION_VIEW,uri));} catch(Exception ignored) {}
                }
                return true;
            }
            @Override public void onReceivedError(WebView v, android.webkit.WebResourceRequest req, android.webkit.WebResourceError err) {
                if (req.isForMainFrame()) v.loadDataWithBaseURL(null,
                  "<html><meta name='viewport' content='width=device-width,initial-scale=1'><body style='font:18px sans-serif;padding:30px;color:#12303A'><h2>Sem conexão</h2><p>Verifique a internet e tente novamente.</p><p><a href='"+appOrigin+"'>Tentar novamente</a></p></body></html>","text/html","UTF-8",null);
            }
        });
        setContentView(view, new ViewGroup.LayoutParams(ViewGroup.LayoutParams.MATCH_PARENT,ViewGroup.LayoutParams.MATCH_PARENT));
        view.loadUrl(target);
    }
    @Override public void onBackPressed() {
        if (view!=null && view.canGoBack()) view.goBack();
        else super.onBackPressed();
    }
    @Override protected void onDestroy() {
        if(view!=null){view.destroy();view=null;}
        super.onDestroy();
    }
}
